# LocalFlow Setup Guide

Hey kiddo! This is a complete guide to setting up LocalFlow on your machine. I built this project for you to learn from - it's a real-world application that combines web development, real-time communication, and AI. Let's get it running!

## What is LocalFlow?

LocalFlow is a **voice dictation system** that lets you speak and have your words automatically typed into any application. It's like having a smart assistant that:

1. Listens when you press a hotkey
2. Transcribes your speech to text
3. Cleans up the text (removes "um", "uh", fixes grammar)
4. Pastes it wherever your cursor is

The cool part? It works in **two modes**:
- **Cloud Mode**: Fast, uses AI services in the cloud
- **Local Mode**: Free, runs everything on your own computer

---

## Prerequisites

Before we start, make sure you have these installed:

### 1. Bun (JavaScript Runtime)
Bun is a fast JavaScript runtime like Node.js, but faster. Install it:

```bash
# macOS or Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1|iex"
```

Verify it works:
```bash
bun --version
# Should print something like: 1.x.x
```

### 2. Python 3.7+
The desktop agent is written in Python. Check if you have it:

```bash
python3 --version
# or
python --version
```

If not installed:
- **macOS**: `brew install python`
- **Ubuntu/Debian**: `sudo apt install python3 python3-pip`
- **Windows**: Download from [python.org](https://www.python.org/downloads/)

### 3. Git (optional but recommended)
For version control. Most systems have it, check with:
```bash
git --version
```

---

## Quick Start (5 minutes)

Let's get the basic setup running first, then we'll explore the advanced features.

### Step 1: Navigate to the Project

```bash
cd /path/to/localflow
```

### Step 2: Install Dependencies

```bash
bun install
```

This downloads all the JavaScript packages the project needs.

### Step 3: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default settings use "cloud" mode, which is simulated in demo mode.

### Step 4: Start the Application

Open **two terminal windows**:

**Terminal 1 - Web Application:**
```bash
bun run dev
```

**Terminal 2 - WebSocket Service:**
```bash
bun run dev:ws
```

Or use this single command to run both:
```bash
bun run dev:all
```

### Step 5: Open the Web UI

Go to [http://localhost:3000](http://localhost:3000) in your browser.

You should see the LocalFlow interface with a big microphone button!

### Step 6: Test Recording

1. Click the microphone button
2. Speak something
3. Click again to stop
4. See the transcribed text appear

**Note**: The demo mode returns placeholder text. For real transcription, you'll need to set up cloud or local processing (covered below).

---

## Project Structure Explained

Let me walk you through what each part of the codebase does:

```
localflow/
├── src/                          # Main application source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx             # Main UI (the recording interface)
│   │   ├── layout.tsx           # Root layout (applies to all pages)
│   │   ├── globals.css          # Global styles
│   │   └── api/                 # API routes (backend endpoints)
│   │       └── dictation/
│   │           ├── transcribe/  # Speech-to-text endpoint
│   │           └── refine/      # Text cleanup endpoint
│   ├── components/
│   │   └── ui/                  # Reusable UI components (buttons, cards, etc.)
│   ├── hooks/
│   │   └── use-websocket.ts     # Custom hook for WebSocket connection
│   └── lib/
│       └── utils.ts             # Helper functions
│
├── mini-services/
│   └── websocket-service/       # Real-time communication server
│       └── index.ts             # Socket.IO server
│
├── agent/
│   └── localflow-agent.py       # Desktop Python agent
│
├── scripts/
│   └── setup-local.sh           # Script to set up local AI processing
│
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── .env.example                # Example environment variables
```

---

## Understanding the Architecture

Here's how the pieces fit together:

```
┌─────────────────┐         ┌──────────────────┐
│   Web Browser   │◄───────►│  Next.js App     │
│   (page.tsx)    │   HTTP  │  (port 3000)     │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ WebSocket                 │ API calls
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│ WebSocket       │◄───────►│  Transcribe API  │
│ Service         │         │  Refine API      │
│ (port 3001)     │         │                  │
└────────┬────────┘         └──────────────────┘
         │
         │ WebSocket
         │
         ▼
┌─────────────────┐
│ Desktop Agent   │
│ (Python)        │
│ Global Hotkey   │
└─────────────────┘
```

### Flow:
1. **User speaks** into microphone
2. **Audio captured** by browser or desktop agent
3. **Sent to API** for transcription
4. **API returns** transcribed text
5. **Text refined** using AI (grammar, formatting)
6. **Result displayed** or pasted into active application

---

## Setting Up the Desktop Agent

The desktop agent lets you dictate in ANY application using a global hotkey.

### Step 1: Install Python Dependencies

```bash
cd agent
pip install pynput sounddevice scipy python-socketio pyperclip pyautogui numpy
```

Or install them all at once:
```bash
pip install pynput sounddevice scipy python-socketio pyperclip pyautogui numpy
```

### Step 2: Run the Agent

```bash
python localflow-agent.py
```

You should see:
```
============================================
LocalFlow Desktop Agent
============================================
Hotkey: alt+v
Mode: developer
Processing: cloud
============================================
Listening for hotkey: alt+v
Press the hotkey to start recording, release to stop and transcribe.
Press Ctrl+C to exit.
```

### Step 3: Use It!

1. Make sure the web app is running (`bun run dev:all`)
2. Open any text editor (VS Code, Notepad, etc.)
3. Hold **Alt+V** and speak
4. Release when done
5. Text appears where your cursor is!

### macOS Note:
You need to grant permissions:
- **System Preferences → Security & Privacy → Privacy**
- Enable for: Microphone, Accessibility

---

## Setting Up Local Mode (Advanced)

Local mode processes everything on your computer - no cloud services needed!

### What You Need:
1. **Ollama** - Runs AI models locally
2. **Whisper.cpp** - Speech-to-text on your machine

### Automatic Setup:

Run the setup script:
```bash
./scripts/setup-local.sh
```

This will:
- Install Ollama
- Download a language model
- Build Whisper.cpp
- Download a speech model
- Configure your `.env` file

### Manual Setup:

#### Install Ollama:
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

Start Ollama and download a model:
```bash
ollama serve  # In one terminal
ollama pull llama3.2:1b  # In another terminal
```

#### Install Whisper.cpp:
```bash
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
./models/download-ggml-model.sh small
```

#### Configure Environment:

Edit your `.env` file:
```bash
PROCESSING_MODE=local
WHISPER_PATH=/path/to/whisper.cpp/main
WHISPER_MODEL_PATH=./models/ggml-small-q5_1.bin
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

---

## Key Concepts to Learn From This Project

### 1. **React & Next.js**
- Server and client components
- App Router (file-based routing)
- API routes (serverless functions)

Look at: `src/app/page.tsx`, `src/app/api/`

### 2. **TypeScript**
- Type safety
- Interfaces and types
- Generics

Look at: `src/lib/utils.ts`, `src/hooks/use-websocket.ts`

### 3. **Real-time Communication**
- WebSockets
- Socket.IO namespaces
- Event-driven architecture

Look at: `mini-services/websocket-service/index.ts`

### 4. **UI Components**
- Reusable components
- shadcn/ui patterns
- Tailwind CSS styling

Look at: `src/components/ui/`

### 5. **Audio Processing**
- Web Audio API
- MediaRecorder
- Binary data handling

Look at: `src/app/page.tsx` (startRecording, stopRecording)

### 6. **Python System Programming**
- Global hotkeys
- Audio capture
- Clipboard manipulation

Look at: `agent/localflow-agent.py`

---

## Common Issues & Solutions

### "Port 3000 already in use"
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "WebSocket connection failed"
Make sure both servers are running:
```bash
bun run dev      # Terminal 1
bun run dev:ws   # Terminal 2
```

### "Microphone permission denied"
- **Chrome**: Click the camera icon in the address bar
- **macOS**: System Preferences → Security & Privacy → Microphone

### "Python agent won't start"
Install all dependencies:
```bash
pip install pynput sounddevice scipy python-socketio pyperclip pyautogui numpy
```

### "Ollama not responding"
Make sure it's running:
```bash
ollama serve
```

---

## Development Tips

### Hot Reloading
Both `bun run dev` and the WebSocket service support hot reloading. Just save your changes and they'll apply automatically.

### Debugging
Add console.log statements or use your browser's DevTools (F12):
- **Console tab**: See logs
- **Network tab**: See API calls
- **Application tab**: See localStorage

### VS Code Extensions I Recommend
- ESLint
- Tailwind CSS IntelliSense
- Python
- Pretty TypeScript Errors

---

## Next Steps

Once you're comfortable with the basics:

1. **Add a new refinement mode** - Edit `src/app/api/dictation/refine/route.ts`
2. **Change the UI theme** - Modify `src/app/globals.css`
3. **Add history search** - Enhance the history dialog in `page.tsx`
4. **Build a browser extension** - Use the WebSocket patterns you learned

---

## Getting Help

If you get stuck:

1. **Read the error message** - It often tells you exactly what's wrong
2. **Check the console** - Browser DevTools (F12) → Console
3. **Google the error** - Someone's probably had the same issue
4. **Read the code comments** - I added lots of explanations

---

## Final Notes

I'm proud of you for diving into this! Building real applications is the best way to learn programming. This project touches on:

- Frontend (React/Next.js)
- Backend (API routes)
- Real-time systems (WebSockets)
- AI/ML (speech recognition, language models)
- System programming (Python desktop agent)

Take your time understanding each piece. Don't be afraid to break things - that's how you learn!

Love,
Dad

---

## Quick Reference

### Start Everything
```bash
bun run dev:all
```

### Start Individual Services
```bash
bun run dev      # Web app on :3000
bun run dev:ws   # WebSocket on :3001
```

### Start Desktop Agent
```bash
cd agent
python localflow-agent.py
```

### Default Hotkey
`Alt + V` (hold to record, release to transcribe)

### URLs
- Web UI: http://localhost:3000
- WebSocket: ws://localhost:3001
