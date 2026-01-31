# Branch Changes Summary: Easy-Setup Branch

## Overview
This branch adds non-technical user support to LocalFlow, including:
- In-app API key configuration (no .env editing)
- Web UI WebSocket mode for auto-paste
- Auto-start scripts
- iOS PWA support
- Foundation for Android receiver app

## Changes Made

### 1. WebSocket Service (`mini-services/websocket-service/index.ts`)
- Added `/web` namespace for browser-based auto-paste
- Added `/receiver` namespace (foundation for Android receiver apps)
- Web UI can now send audio via WebSocket to trigger agent paste

### 2. API Key Management
- **New API Route**: `src/app/api/settings/api-key/route.ts`
  - Stores API key in user's home directory (`~/.localflow/`)
  - GET/POST/DELETE endpoints
  - Secure file permissions (0o600)
- **New Component**: `src/components/api-key-input.tsx`
  - UI for entering/removing API key
  - Shows validation and status
  - Links to Groq console
- **New UI Component**: `src/components/ui/input.tsx`
  - shadcn-style input component

### 3. Web UI Updates (`src/app/page.tsx`)
- Added WebSocket connection to `/web` namespace
- Added `useAgentPaste` toggle
- Shows paste mode indicator (Auto-paste vs Browser)
- Routes audio to WebSocket when agent is available
- Falls back to HTTP mode when agent unavailable
- Added API key input to Settings dialog

### 4. API Routes Updated
- `src/app/api/dictation/transcribe/route.ts`
  - Now checks stored API key if env var not set
- `src/app/api/dictation/refine/route.ts`
  - Now checks stored API key if env var not set

### 5. iOS PWA (`src/app/mobile/`)
- Complete PWA for iOS remote microphone
- Uses Web Audio API + AudioWorklet
- Connects via WebSocket `/mobile` namespace
- PWA manifest and service worker
- iOS install prompt component

### 6. Auto-Start Scripts
- `scripts/start-easy.bat` (Windows batch)
- `scripts/start-easy.ps1` (Windows PowerShell)
- Start all services with one click
- Open browser automatically
- Show helpful messages

### 7. Documentation
- `EASY_SETUP.md` - Non-technical user guide
- `IOS_PWA_SETUP.md` - iOS PWA setup instructions
- `WEB_UI_WEBSOCKET_MODE.md` - Technical explanation of WebSocket mode
- `BRANCH_CHANGES_SUMMARY.md` - This file

## How It Works

### For Non-Technical Users (iPhone + Chromebook Scenario)

**On the Computer (Windows/Mac/Linux):**
```
1. Run: start-easy.bat
2. Open http://localhost:3005
3. Enter Groq API key in Settings
4. Desktop Agent auto-starts
```

**On iPhone:**
```
1. Open Safari
2. Go to http://COMPUTER_IP:3005/mobile
3. Add to Home Screen
4. Tap to record → speak → release
5. Text appears on computer!
```

**On Chromebook (Future):**
```
1. Install Android Receiver app
2. Connects to computer's WebSocket
3. Receives text and pastes locally
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ iOS PWA         │────►│ Bun WebSocket    │────►│ Desktop Agent   │
│ (Phone)         │     │ Service          │     │ (Paste)         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Next.js API      │
                        │ (Transcription)  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Groq API         │
                        │ (Cloud STT/LLM)  │
                        └──────────────────┘
```

## What This Enables

| Before | After |
|--------|-------|
| Edit .env for API key | Enter key in Settings UI |
| Web UI = browser only | Web UI can auto-paste via agent |
| iPhone = not supported | iPhone PWA works as remote mic |
| Chromebook = not supported | Android receiver foundation |
| Multiple terminal windows | One-click start script |

## Backwards Compatibility

Your existing setup still works:
- Python agent hotkey recording → unchanged
- HTTP API mode → unchanged
- .env file → still supported (priority over stored key)

## Files Not Touched

Your current working setup in the other branch:
- `agent/localflow-agent.py` - unchanged
- `agent/recording_overlay.py` - unchanged
- Original WebSocket service behavior - unchanged
- Original API routes - just added fallback logic

## Next Steps (Future Work)

1. **Android Receiver App** - New app that receives from `/receiver` namespace and pastes locally
2. **Chrome Extension** - For Chromebooks without Android support
3. **Packaged Installers** - .exe/.dmg/.AppImage for one-click install
4. **Auto-updater** - Check for updates and install automatically

## Testing This Branch

```bash
# Switch to this branch
git checkout easy-setup-branch

# Install dependencies
bun install

# Start everything
./scripts/start-easy.ps1  # Windows
# or
./scripts/start-easy.sh   # Mac/Linux

# Open browser
http://localhost:3005
```

## Merging Notes

When merging to main:
1. This branch is additive - doesn't break existing functionality
2. API key storage is opt-in (env var takes priority)
3. WebSocket mode is opt-in (toggle in Settings)
4. All changes are backwards compatible
