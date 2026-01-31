# Web UI WebSocket Mode - Implementation Summary

## What Was Implemented

The Web UI can now send audio to the Desktop Agent via WebSocket (like the mobile PWA), enabling **automatic paste to any active application**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WEB UI (Browser)                                                       │
│  • Records audio                                                        │
│  • Connects to ws://localhost:3002/web  ← NEW!                          │
│  • Sends audio via WebSocket OR HTTP (user choice)                      │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌──────────────────────────────────────────┐
│  WEBSOCKET      │            │  HTTP (Fallback)                         │
│  /web namespace │            │  Next.js API routes                      │
│  (NEW!)         │            │  (Original behavior)                     │
└────────┬────────┘            └──────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BUN WEBSOCKET SERVICE (Port 3002)                                      │
│  • /web namespace receives audio from Web UI                            │
│  • Forwards to Python Agent via /agent namespace                        │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DESKTOP AGENT (Python)                                                 │
│  • Receives audio via /agent WebSocket                                  │
│  • Calls Groq API for transcription                                     │
│  • Copies to clipboard + simulates paste (Ctrl+V)                       │
│  • Result appears in whatever app you're using!                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## New Features

### 1. Auto-Paste Mode Toggle

Users can now choose between:

| Mode | Behavior | Requires Desktop Agent |
|------|----------|----------------------|
| **Auto-paste** | Result pasted directly to active app | ✅ Yes |
| **Browser** | Result shown on page, copied to clipboard | ❌ No |

### 2. Visual Indicators

- **Blue badge** ("Auto-paste"): Audio sent via WebSocket, will paste to active app
- **Gray badge** ("Browser"): Using HTTP mode, manual copy needed

### 3. Settings Panel Updates

Added toggle: **"Auto-paste to active app"**
- Enabled only when Desktop Agent is running
- Disabled/enabled state reflects agent availability

## Code Changes

### 1. WebSocket Service (`mini-services/websocket-service/index.ts`)

Added new `/web` namespace:
```typescript
const webNamespace = io.of("/web");

webNamespace.on("connection", (socket) => {
  socket.on("process_audio", async (message) => {
    // Forward to Python Agent (same as /mobile)
    await processAudio(socket, message, "mobile");
  });
});
```

### 2. Web UI (`src/app/page.tsx`)

- Added second WebSocket connection to `/web` namespace
- Added `processRecordingWebSocket()` function
- Added `processRecordingHTTP()` function (original)
- Added `useAgentPaste` state toggle
- Routes to appropriate handler based on toggle + agent availability

### 3. Key Functions

```typescript
// Main router - chooses WebSocket or HTTP
const processRecording = async (audioBlob: Blob) => {
  if (useAgentPaste && webSocketConnected && status.agentOnline) {
    await processRecordingWebSocket(audioBlob);  // Agent paste
  } else {
    await processRecordingHTTP(audioBlob);         // Browser copy
  }
};
```

## User Experience

### Scenario 1: Full Setup (Recommended)

1. User starts Desktop Agent (`python localflow-agent.py`)
2. User opens Web UI at `http://localhost:3005`
3. Web UI shows: **"Agent Online"** + **"Auto-paste"** mode
4. User clicks record, speaks
5. User switches to VS Code (or any app)
6. Releases record button
7. **Text appears directly in VS Code!** ✨

### Scenario 2: Web UI Only (No Agent)

1. User only starts Next.js server (`bun run dev`)
2. User opens Web UI
3. Web UI shows: **"Agent Offline"** + **"Browser"** mode
4. User records and processes
5. Result appears on page, copied to clipboard
6. User manually pastes where needed

### Scenario 3: Mixed Usage

1. User has Desktop Agent running
2. User toggles **"Auto-paste"** on/off as needed
3. When on: Results go to active app
4. When off: Results stay in browser

## Benefits

| Before | After |
|--------|-------|
| Web UI could only copy to browser clipboard | Web UI can paste to ANY application |
| Had to use mobile PWA for remote mic | Web UI + Desktop Agent = same power |
| Required manual copy-paste from browser | Optional automatic paste |
| Mobile and Web had different capabilities | Both use same WebSocket path |

## Technical Notes

1. **Fallback**: If agent disconnects mid-session, falls back to HTTP mode
2. **WebSocket persistence**: /web connection stays open, reuses existing Bun WS service
3. **No changes to**: Python Agent, Android app, iOS PWA (they already work this way)
4. **Dependencies**: Uses existing `socket.io-client` package

## Future Enhancements

1. **Wake lock**: Keep screen on during recording
2. **Keyboard shortcut**: Spacebar to toggle record (when not in text field)
3. **Visual audio level**: Show waveform during recording
4. **Multiple agents**: Support connecting to different desktop agents
