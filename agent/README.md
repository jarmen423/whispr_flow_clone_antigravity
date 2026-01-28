# LocalFlow Desktop Agent

The LocalFlow desktop agent enables system-wide dictation with a global hotkey. Press and hold the hotkey to record, release to transcribe and paste.

## Quick Start

### 1. Install Dependencies

```bash
pip install pynput sounddevice scipy python-socketio pyperclip pyautogui numpy
```

### 2. Run the Agent

```bash
python localflow-agent.py
```

### 3. Use

1. Press and hold `Alt+V` (default hotkey)
2. Speak clearly
3. Release the keys
4. Text is automatically pasted at your cursor

## Configuration

Set these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCALFLOW_WS_URL` | `http://localhost:3001` | WebSocket server URL |
| `LOCALFLOW_HOTKEY` | `alt+v` | Global hotkey |
| `LOCALFLOW_MODE` | `developer` | Refinement mode (developer, concise, professional, raw) |
| `LOCALFLOW_PROCESSING` | `cloud` | Processing mode (cloud, local) |
| `DEBUG` | - | Set to any value for debug logging |

## Hotkey Options

- `alt+v` - Alt + V (default)
- `ctrl+shift+v` - Ctrl + Shift + V
- `cmd+shift+v` - Cmd + Shift + V (macOS)

## Troubleshooting

### "No audio device found"
Make sure you have a microphone connected and it's the default input device.

### "Connection failed"
Ensure the LocalFlow server is running:
```bash
cd /path/to/localflow
bun run dev:all
```

### "Permission denied" (Linux)
You may need to run with elevated permissions for the global hotkey to work in all applications.

### macOS Permissions
Grant these permissions in System Preferences > Security & Privacy:
- Microphone access
- Accessibility (for keyboard simulation)

## Requirements

- Python 3.7+
- Working microphone
- LocalFlow server running
