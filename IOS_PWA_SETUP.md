# LocalFlow iOS PWA - Remote Microphone

This guide explains how to use the iOS Progressive Web App (PWA) to turn your iPhone/iPad into a remote microphone for LocalFlow dictation.

## Overview

The iOS PWA provides a native-like experience for iPhone and iPad users who want to use their device as a wireless microphone for the LocalFlow dictation system. It uses the Web Audio API to capture high-quality audio and sends it via WebSocket to your desktop.

**Key Features:**
- Works entirely in Safari/Chrome on iOS (no App Store download needed)
- Captures audio at 16kHz mono (optimal for Whisper.cpp)
- Real-time audio level visualization
- Configurable refinement modes (developer/concise/professional/raw)
- Works on local network (no internet required for local mode)
- Offline support via service worker

---

## Installation

### Step 1: Start LocalFlow Server

Make sure your LocalFlow server is running on your desktop:

```powershell
# From project root
bun run dev:all
```

Or using the startup script:

```powershell
.\scripts\start-all.ps1
```

### Step 2: Connect iOS Device to Same Network

Ensure your iPhone/iPad is on the same WiFi network as your desktop computer.

### Step 3: Access the Mobile App

On your iOS device:

1. Open Safari or Chrome
2. Navigate to your desktop's IP address with the port:
   ```
   http://YOUR_DESKTOP_IP:3005/mobile
   ```
   
   To find your desktop IP:
   - **Windows**: Run `ipconfig` in PowerShell
   - **macOS/Linux**: Run `ifconfig` or `ip addr`

3. You should see the LocalFlow Mobile interface

### Step 4: Add to Home Screen (Recommended)

For the best experience, add the app to your home screen:

1. Tap the **Share** button (square with arrow)
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"** in the top right

The app will now appear on your home screen with the LocalFlow icon and launch in full-screen mode without the browser UI.

---

## Usage

### Basic Recording

1. **Open the App**: Tap the LocalFlow icon on your home screen
2. **Check Connection**: Ensure the status shows "Connected"
3. **Start Recording**: Tap the large blue microphone button
4. **Speak**: Hold while speaking - you'll see the red recording indicator
5. **Stop Recording**: Tap the red stop button (or wait for auto-stop in future versions)

### Settings

Tap the settings card to configure:

- **Refinement Mode**: Choose how your text is processed
  - `developer` - Corrects grammar, formats technical terms
  - `concise` - Shortens and simplifies
  - `professional` - Business-appropriate language
  - `raw` - No refinement, just transcription

- **Processing Mode**: Choose where processing happens
  - `cloud` - Fast processing via Z.AI API (requires API key)
  - `local` - Free processing via Whisper.cpp + Ollama

### Viewing Results

After processing, the transcribed and refined text will:
1. Appear in the "Last Result" section of the mobile app
2. Be automatically pasted into your desktop's active application
3. Be copied to your desktop clipboard

---

## Technical Details

### Audio Pipeline

```
iOS Microphone
    ↓
Web Audio API (16kHz, mono)
    ↓
AudioWorklet (raw PCM processing)
    ↓
Float32 → Int16 conversion
    ↓
WAV file creation (in-memory)
    ↓
Base64 encoding
    ↓
WebSocket (/mobile namespace)
    ↓
LocalFlow Server
    ↓
Whisper.cpp / Z.AI Transcription
    ↓
Ollama / Z.AI Refinement
    ↓
Desktop Agent → Clipboard → Paste
```

### WebSocket Protocol

The iOS PWA uses the existing `/mobile` namespace:

**iOS → Server:**
- `recording_started` - Notifies when recording begins
- `process_audio` - Sends base64-encoded WAV audio

**Server → iOS:**
- `connection_confirmed` - Connection established
- `dictation_result` - Transcription result
- `error` - Error messages

### Browser Compatibility

| Feature | Safari iOS | Chrome iOS |
|---------|------------|------------|
| Web Audio API | ✅ 14.5+ | ✅ |
| AudioWorklet | ✅ 15+ | ✅ |
| Service Worker | ✅ 11.3+ | ✅ |
| PWA Install | ✅ 16.4+ (standalone) | ⚠️ Limited |

**Recommendation**: Use Safari for the best PWA experience on iOS.

---

## Troubleshooting

### "Not Connected to Server"

1. Verify the LocalFlow server is running on your desktop
2. Check that your iOS device and desktop are on the same WiFi network
3. Try accessing the desktop IP directly: `http://YOUR_IP:3005/mobile`
4. Check firewall settings on your desktop (port 3005 and 3002 must be open)

### "Failed to Access Microphone"

1. When prompted, tap **"Allow"** for microphone access
2. If denied, go to **Settings → Safari → Microphone** and enable
3. For Chrome: **Settings → Chrome → Microphone**

### "No Audio Recorded"

1. Ensure you're holding the record button while speaking
2. Check that the audio level indicator is moving
3. Try speaking louder or closer to the device
4. Check that your microphone isn't muted (iOS Control Center)

### Audio Quality Issues

1. Move closer to your iOS device
2. Reduce background noise
3. Speak clearly and at a moderate pace
4. Check that noise suppression is enabled in settings

### Processing Errors

1. Verify the desktop agent is running and connected
2. Check the LocalFlow server logs for errors
3. Ensure Whisper.cpp or Z.AI API is properly configured
4. For local mode, verify Ollama is running on the desktop

---

## Security Considerations

- **Local Network Only**: The iOS PWA requires your device to be on the same network as your desktop
- **No Cloud Storage**: Audio is processed in real-time and not stored
- **HTTPS Recommended**: For production use, configure HTTPS to ensure secure WebSocket connections
- **CORS**: The WebSocket server validates origins based on `ALLOWED_ORIGINS` environment variable

---

## Development

### Running Locally

```bash
# Start the development server
bun run dev:all

# On your iOS device, navigate to:
# http://YOUR_LOCAL_IP:3005/mobile
```

### Debugging

1. Connect your iOS device to a Mac
2. Open Safari on Mac
3. Go to **Develop → [Your Device] → localhost**
4. Use Web Inspector to debug

### File Structure

```
src/app/mobile/
├── page.tsx              # Main mobile interface
└── ios-install-prompt.tsx # iOS install instructions

public/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── audio-processor.worklet.js  # Audio processing
└── icon-*.svg           # App icons
```

---

## Comparison: iOS PWA vs Android App

| Feature | iOS PWA | Android App |
|---------|---------|-------------|
| Installation | Safari "Add to Home Screen" | APK install |
| Updates | Automatic | Manual APK update |
| Audio Quality | 16kHz via Web Audio API | 16kHz native |
| Offline Support | Yes (cached) | No |
| Background Audio | No (Safari limitation) | Yes |
| Push-to-Talk | Tap to toggle | Hold to talk |
| System Integration | Limited | Full (notifications, etc.) |

---

## Future Enhancements

Potential improvements for the iOS PWA:

1. **Wake Lock**: Prevent screen from sleeping during recording
2. **Push-to-Talk**: Hold gesture support (currently tap-to-toggle)
3. **Background Audio**: Process audio when app is backgrounded
4. **Shortcuts Integration**: Siri shortcuts for quick recording
5. **Audio Compression**: Opus compression for lower bandwidth
6. **Multi-language**: UI localization

---

## Support

For issues or questions:

1. Check the main [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review [CLAUDE.md](CLAUDE.md) for architecture details
3. Check browser console logs (Safari Web Inspector)
4. Check LocalFlow server logs for WebSocket/Processing errors
