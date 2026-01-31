# LocalFlow Receiver - Android App

Receive dictation from LocalFlow and paste it into any app on your Android device or Chromebook.

## Features

- Connect to LocalFlow WebSocket service
- Receive transcribed text in real-time
- Auto-paste using Accessibility Service
- Or copy to clipboard with notification
- Works on Android phones, tablets, and Chromebooks

## Use Cases

1. **Phone as mic, Chromebook as receiver**: Dictate on your phone, type on your Chromebook
2. **Tablet as receiver**: Use your phone to dictate into your tablet
3. **Multiple receivers**: Send to multiple devices at once

## Setup

1. Build and install the APK
2. Open the app
3. Enter your LocalFlow server IP address
4. Enable Accessibility Service (for auto-paste)
5. Start receiving!

## Architecture

```
Sender (iPhone/Android/Web) 
    ↓ WebSocket
LocalFlow WebSocket Service
    ↓ WebSocket /receiver
Android Receiver App
    ↓ Accessibility Service or Clipboard
Any Android App (Chrome, Docs, etc.)
```

## Permissions

- `INTERNET` - Connect to WebSocket server
- `BIND_ACCESSIBILITY_SERVICE` - Auto-paste into other apps (optional)
- `FOREGROUND_SERVICE` - Keep connection alive
- `POST_NOTIFICATIONS` - Show paste notifications
