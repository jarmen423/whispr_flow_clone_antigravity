# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalFlow is a voice dictation system that transcribes speech to text and refines it using AI. The system supports three processing modes:

1. **Cloud Mode**: Fast processing via Z.AI API (requires API key, pay-per-use)
2. **Networked Local Mode** (default): Free processing using remote Whisper.cpp and Ollama servers on your network
3. **Local Mode**: Free processing with everything running on the same machine

## Common Development Commands

### Starting the Application

```bash
# Start both Next.js app and WebSocket service (recommended)
bun run dev:all

# Start individually
bun run dev          # Next.js app on port 3005
bun run dev:ws       # WebSocket service on port 3001
```

### Building and Production

```bash
bun run build        # Build Next.js app
bun run start        # Start production server
bun run start:ws     # Start WebSocket service in production
```

### Testing and Linting

```bash
bun run lint         # Run ESLint
bun run test         # Run Vitest tests
bun run test:watch   # Run tests in watch mode
```

### Running the Desktop Agent

```bash
cd agent
pip install -r requirements.txt
python localflow-agent.py
```

Default hotkey: `Alt+V` (hold to record, release to transcribe)

## Architecture Overview

### System Components

```
┌─────────────────┐         ┌──────────────────┐
│   Web Browser   │◄───────►│  Next.js App     │
│   (page.tsx)    │   HTTP  │  (port 3005)     │
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

### Key Directories

- **`src/app/`** - Next.js App Router pages and API routes
  - `page.tsx` - Main recording UI
  - `api/dictation/transcribe/` - Speech-to-text endpoint
  - `api/dictation/refine/` - Text refinement endpoint
- **`src/components/ui/`** - shadcn/ui components (buttons, dialogs, etc.)
- **`src/hooks/use-websocket.ts`** - WebSocket connection management
- **`mini-services/websocket-service/`** - Socket.IO server (port 3001)
- **`agent/`** - Python desktop agent for global hotkey dictation

## Data Flow

### Cloud Mode Processing

1. Desktop Agent records audio (16kHz, mono, 16-bit WAV)
2. Converts to base64 and sends via WebSocket
3. POST to `/api/dictation/transcribe` (mode=cloud)
4. Next.js calls Z.AI ASR API → returns text
5. POST to `/api/dictation/refine` (mode=cloud)
6. Next.js calls Z.AI LLM API → returns refined text
7. WebSocket sends result back to agent
8. Agent copies to clipboard and sends Ctrl+V

### Local Mode Processing

1. Desktop Agent records audio
2. Sends via WebSocket to `/api/dictation/transcribe` (mode=local)
3. Next.js saves temp file and executes whisper.cpp binary
4. Reads output text file
5. POST to `/api/dictation/refine` (mode=local)
6. Next.js calls Ollama API (localhost:11434) → returns refined text
7. WebSocket sends result back to agent

## WebSocket Protocol

### Namespaces

- **`/agent`** - Desktop agent connections
- **`/ui`** - Web UI connections

### Agent → Server Messages

- **`ping`** - Heartbeat every 5 seconds
- **`process_audio`** - Dictation request with base64 audio
- **`recording_started`** - Notification when recording begins

### Server → Agent Messages

- **`connection_confirmed`** - Sent on successful connection
- **`dictation_result`** - Processing response with text
- **`settings_update`** - Broadcast from UI when settings change

### Server → UI Messages

- **`agent_status`** - Agent online/offline status
- **`update`** - Live activity (dictation_complete, recording_started)

## Environment Configuration

Key environment variables in `.env`:

```bash
# Processing mode: cloud | networked-local | local
PROCESSING_MODE=networked-local

# Cloud mode (requires ZAI_API_KEY)
ZAI_API_KEY=your_key_here

# Networked-local mode (requires WHISPER_API_URL)
WHISPER_API_URL=http://192.168.1.100:8080

# Local mode (requires WHISPER_PATH and WHISPER_MODEL_PATH)
WHISPER_PATH=/usr/local/bin/whisper
WHISPER_MODEL_PATH=./models/ggml-small-q5_1.bin

# Ollama (used for both networked-local and local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

## Processing Mode Selection

The application automatically falls back between modes based on configuration:

- **Cloud** falls back to **networked-local** if `ZAI_API_KEY` is not set
- **Networked-local** falls back to **local** if `WHISPER_API_URL` is not set
- This is handled in `getEffectiveMode()` in both transcribe and refine routes

## Refinement Modes

The system supports four text refinement modes:

- **`developer`** (default): Corrects grammar, removes filler words, formats technical terms correctly
- **`concise`**: Shortens and simplifies text while keeping meaning
- **`professional`**: Transforms casual language into business-appropriate text
- **`raw`**: Returns transcription unchanged (no LLM call)

System prompts are defined in `src/app/api/dictation/refine/route.ts`.

## Desktop Agent Configuration

Set via environment variables:

```bash
LOCALFLOW_WS_URL=http://localhost:3001    # WebSocket server URL
LOCALFLOW_HOTKEY=alt+v                    # Global hotkey
LOCALFLOW_MODE=developer                  # Refinement mode
LOCALFLOW_PROCESSING=cloud                # Processing mode
DEBUG=1                                   # Enable debug logging
```

## Important Implementation Details

### Audio Format

- Sample rate: 16kHz
- Channels: 1 (mono)
- Bit depth: 16-bit PCM
- Format: WAV (native for Whisper.cpp)

This format is used by the Python agent to ensure compatibility with Whisper.cpp without transcoding.

### Temporary File Management

Local transcription creates temp files in `/tmp/localflow/`:
- Input: `audio_<timestamp>.wav`
- Output: `audio_<timestamp>.txt`

Files are cleaned up after processing. The temp directory is created automatically if it doesn't exist.

### Rate Limiting

- Max 30 messages per minute per agent (WebSocket service)
- Prevents abuse and manages resource usage

### Stale Connection Detection

- Agents are disconnected after 30 seconds of inactivity
- Checked every 10 seconds
- WebSocket service broadcasts offline status to UI

## Port Configuration

Default ports (can be changed via environment variables):

- **3005** - Next.js application (`PORT`)
- **3001** - WebSocket service (`WS_PORT`)
- **11434** - Ollama server
- **8080** - Whisper.cpp server (networked-local mode)

## UI Components

The application uses shadcn/ui components built on Radix UI primitives:
- Button, Card, Dialog, Select, Switch, Textarea, Label, Alert

Components are in `src/components/ui/` and follow the shadcn/ui pattern.

## Testing

Run tests with Vitest:

```bash
bun run test              # Run all tests
bun run test:watch        # Watch mode
bun run test:coverage     # Coverage report
```

Test files should be placed in a `tests/` directory.

## Troubleshooting

### "Whisper binary not found"

- Check `WHISPER_PATH` in `.env` points to the actual binary
- On Windows, use backslashes or double backslashes in paths

### "Ollama not responding"

- Ensure Ollama is running: `ollama serve`
- Check `OLLAMA_URL` is correct
- Test connection: `curl http://localhost:11434/api/tags`

### WebSocket connection issues

- Ensure both services are running: `bun run dev:all`
- Check ports are not already in use
- Verify `NEXT_PUBLIC_WS_URL` environment variable

### Desktop agent won't start

- Install Python dependencies: `pip install -r agent/requirements.txt`
- Check `LOCALFLOW_WS_URL` matches WebSocket service port
- On macOS, grant microphone and accessibility permissions

## Development Notes

- The application uses Bun for JavaScript runtime (faster than Node.js)
- Next.js 16 with React 19 and App Router
- TypeScript strict mode enabled
- WebSocket service uses Socket.IO with Bun runtime
- Desktop agent uses Python 3.7+ with standard libraries
