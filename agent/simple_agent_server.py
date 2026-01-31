#!/usr/bin/env python3
"""
LocalFlow Simple Agent Server

A simplified desktop agent that:
1. Runs a WebSocket server to receive audio from browser
2. Calls Groq API for transcription
3. Copies result to clipboard and pastes

No Next.js server needed! No repo cloning needed!

Usage:
    python simple_agent_server.py
    
Then open the web UI (just an HTML file) in your browser.
"""

import os
import asyncio
import base64
import tempfile
import json
from typing import Optional
import webbrowser
import http.server
import socketserver
import threading

# Audio processing
import numpy as np
from scipy.io import wavfile

# System interaction
import pyperclip
import pyautogui

# WebSocket server
import socketio
from aiohttp import web

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_ASR_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
GROQ_LLM_URL = "https://api.groq.com/openai/v1/chat/completions"
ASR_MODEL = "whisper-large-v3"
LLM_MODEL = "llama-3.3-70b-versatile"

# Create Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="aiohttp")
app = web.Application()
sio.attach(app)


async def transcribe_audio(audio_base64: str) -> str:
    """Transcribe audio using Groq Whisper API"""
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY not set. Get one at https://console.groq.com/keys")
    
    import aiohttp
    
    # Decode base64 to bytes
    audio_bytes = base64.b64decode(audio_base64)
    
    # Create form data
    form = aiohttp.FormData()
    form.add_field("file", audio_bytes, filename="audio.wav", content_type="audio/wav")
    form.add_field("model", ASR_MODEL)
    form.add_field("response_format", "json")
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            GROQ_ASR_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            data=form,
            timeout=aiohttp.ClientTimeout(total=60)
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"Groq ASR error: {error_text}")
            
            result = await response.json()
            return result.get("text", "").strip()


async def refine_text(text: str, mode: str = "developer") -> str:
    """Refine text using Groq LLM API"""
    if not GROQ_API_KEY:
        return text
    
    if mode == "raw":
        return text
    
    import aiohttp
    
    system_prompts = {
        "developer": """You are a dictation correction tool for developers. Clean up the transcript by:
1. Correcting grammar and punctuation
2. Removing filler words (um, uh, like, you know)
3. Formatting technical terms correctly
4. Keeping the same tone and voice
Output ONLY the cleaned text, nothing else.""",
        "concise": "Remove filler words and make this text concise. Output ONLY the result.",
        "professional": "Transform this into professional business language. Output ONLY the result.",
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            GROQ_LLM_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompts.get(mode, system_prompts["developer"])},
                    {"role": "user", "content": f"Clean up this transcript:\n\n{text}"}
                ],
                "temperature": 0.1,
                "max_tokens": 2000
            },
            timeout=aiohttp.ClientTimeout(total=30)
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                print(f"[Refine] Warning: {error_text}")
                return text  # Fallback to raw text
            
            result = await response.json()
            return result["choices"][0]["message"]["content"].strip()


def paste_text(text: str):
    """Copy to clipboard and simulate paste"""
    try:
        pyperclip.copy(text)
        print(f"[Agent] Copied to clipboard: {text[:50]}...")
        
        # Small delay for clipboard to be ready
        import time
        time.sleep(0.2)
        
        # Simulate paste
        pyautogui.hotkey("ctrl", "v")
        print("[Agent] Pasted to active application")
        
    except Exception as e:
        print(f"[Agent] Paste error: {e}")


@sio.event
async def connect(sid, environ):
    print(f"[Agent] Client connected: {sid}")
    await sio.emit("connection_confirmed", {"serverTime": asyncio.get_event_loop().time()}, room=sid)


@sio.event
async def disconnect(sid):
    print(f"[Agent] Client disconnected: {sid}")


@sio.on("process_audio")
async def handle_audio(sid, data):
    """Receive audio from browser and process it"""
    print(f"[Agent] Received audio from {sid}")
    
    try:
        audio_base64 = data.get("audio", "")
        mode = data.get("mode", "developer")
        
        if not audio_base64:
            await sio.emit("dictation_result", {
                "success": False,
                "error": "No audio received"
            }, room=sid)
            return
        
        # Step 1: Transcribe
        print("[Agent] Transcribing...")
        original_text = await transcribe_audio(audio_base64)
        print(f"[Agent] Transcribed: {original_text[:50]}...")
        
        # Step 2: Refine (unless raw mode)
        if mode == "raw":
            refined_text = original_text
        else:
            print(f"[Agent] Refining with {mode} mode...")
            refined_text = await refine_text(original_text, mode)
        
        print(f"[Agent] Refined: {refined_text[:50]}...")
        
        # Step 3: Paste to active application
        paste_text(refined_text)
        
        # Step 4: Send result back to browser
        await sio.emit("dictation_result", {
            "success": True,
            "originalText": original_text,
            "refinedText": refined_text,
            "wordCount": len(refined_text.split()),
        }, room=sid)
        
    except Exception as e:
        print(f"[Agent] Error: {e}")
        await sio.emit("dictation_result", {
            "success": False,
            "error": str(e)
        }, room=sid)


@sio.on("recording_started")
async def handle_recording_started(sid, data):
    """Just acknowledge that recording started"""
    print(f"[Agent] Recording started by {sid}")


def serve_static_files():
    """Serve the web UI static files"""
    PORT = 8080
    DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "public")
    
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)
        
        def log_message(self, format, *args):
            pass  # Suppress logs
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[HTTP] Serving web UI at http://localhost:{PORT}")
        httpd.serve_forever()


async def main():
    print("=" * 60)
    print("LocalFlow Simple Agent Server")
    print("=" * 60)
    
    if not GROQ_API_KEY:
        print("\n⚠️  WARNING: GROQ_API_KEY not set!")
        print("   Set it with: export GROQ_API_KEY='your-key-here'")
        print("   Get a key at: https://console.groq.com/keys\n")
    else:
        print(f"✓ Groq API key configured")
    
    # Start static file server in background thread
    static_thread = threading.Thread(target=serve_static_files, daemon=True)
    static_thread.start()
    
    # Open browser
    await asyncio.sleep(1)
    webbrowser.open("http://localhost:8080")
    
    # Start WebSocket server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 3002)
    
    print("✓ WebSocket server running on ws://localhost:3002")
    print("✓ Web UI available at http://localhost:8080")
    print("\nPress Ctrl+C to stop\n")
    
    await site.start()
    
    # Keep running
    while True:
        await asyncio.sleep(3600)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Agent] Shutting down...")
