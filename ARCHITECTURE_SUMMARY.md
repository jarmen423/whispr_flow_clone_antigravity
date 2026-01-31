# Architecture Summary: iPhone to Chromebook Dictation

## The Problem We Solved

**Goal**: Use iPhone as microphone to dictate text onto Chromebook

**Constraints**:
- No external computer hub needed
- Simple setup for non-technical users
- Works on local WiFi

## The Solution

### Efficient Data Flow

```
iPhone (PWA)                              Chromebook (Android)
├─ Record audio                           ├─ Run WebSocket SERVER
├─ Call Groq API (fetch)                  │   (port 3002)
│   iPhone → Internet → Groq Cloud        │
├─ Receive text (~500ms)                  │
│   (text only: ~1KB)                     │
├─ Send via WebSocket ───────────────────►├─ Receive text
│   (local WiFi, tiny data!)              │
└─ Done!                                  └─ Paste to any app
```

### Why This Is Efficient

| Metric | Old Way (Hub) | New Way (Direct) |
|--------|--------------|------------------|
| Audio transfers | 2 times | **1 time** ✓ |
| Local network traffic | Audio (5MB) | **Text (1KB)** ✓ |
| Devices needed | 3 (iPhone, Hub, Chromebook) | **2** ✓ |
| Setup complexity | High | **Low** ✓ |

### Key Insight

**The iPhone can call Groq API directly from the browser!**

Modern browsers support:
- `fetch()` to external APIs
- `navigator.mediaDevices.getUserMedia()` for recording
- `WebSocket` for local device communication

No server needed on the iPhone!

## Components

### 1. iPhone PWA (`src/app/mobile/page.tsx`)

**What it does:**
- Records audio using `MediaRecorder` API
- Calls Groq Whisper API directly (JavaScript `fetch`)
- Calls Groq LLM API for text refinement
- Sends final text via WebSocket to Android receiver
- Displays result on screen

**Key code:**
```javascript
// Call Groq directly from browser!
const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: audioFormData
});

// Then send text to Android via WebSocket
const ws = new WebSocket(`ws://${receiverIp}:3002`);
ws.send(JSON.stringify({ event: 'paste_text', data: { text } }));
```

### 2. Android Receiver App (`android-receiver/`)

**What it does:**
- Runs WebSocket **SERVER** on port 3002
- Waits for iPhone to connect
- Receives text messages
- Pastes into active application using:
  - Clipboard + notifications
  - Accessibility Service (optional, for auto-paste)

**Key code:**
```kotlin
// WebSocket server on Android
class LocalWebSocketServer(port: Int) : WebSocketServer(InetSocketAddress(port)) {
    override fun onMessage(conn: WebSocket, message: String) {
        val json = JSONObject(message)
        val text = json.getJSONObject("data").getString("text")
        
        // Copy to clipboard
        clipboard.setPrimaryClip(ClipData.newPlainText("LocalFlow", text))
        
        // Show notification
        showNotification("Received: $text")
        
        // Try to paste via accessibility
        accessibilityService?.pasteText(text)
    }
}
```

## Data Flow Comparison

### Option A: Computer as Hub (What We Rejected)
```
iPhone → Computer → Groq → Computer → Chromebook
   ↑      ↑         ↑       ↑            ↑
  5MB   5MB      1KB     1KB          1KB
  
Total local network: 6MB
Computer must be running 24/7
```

### Option B: iPhone Direct to Groq (What We Built)
```
iPhone → Groq → iPhone → Chromebook
   ↑      ↑       ↑          ↑
  5MB   1KB     1KB        1KB
     (internet)  (local WiFi)
     
Total local network: 1KB (text only!)
No computer needed
```

## Security Considerations

1. **API Key Storage**
   - Stored in browser localStorage on iPhone
   - Never sent to any server except Groq
   - User enters their own key

2. **Audio Processing**
   - Audio goes directly to Groq (HTTPS)
   - Never stored on intermediate servers
   - Groq's privacy policy applies

3. **Local Network**
   - Only text travels over local WiFi
   - WebSocket is unencrypted (local network only)
   - No sensitive data exposed

## Setup Steps for User

1. **iPhone**: Open PWA URL, enter API key, enter Chromebook IP
2. **Chromebook**: Install APK, open app, tap "Start Receiver"
3. **Both**: Must be on same WiFi
4. **Use**: Record on iPhone, text appears on Chromebook!

## Why This Architecture Wins

| Criterion | Our Solution | Other Options |
|-----------|-------------|---------------|
| Setup complexity | Low | Medium-High |
| Ongoing costs | Free (pay-per-use Groq) | Free-$$$ |
| Privacy | High (direct to Groq) | Medium (through hub) |
| Latency | Low (~1s) | Medium (~2s) |
| Works offline | No | No |
| Battery friendly | Yes | No (hub running) |

## Future Enhancements

1. **Discovery**: Auto-find Chromebook IP using mDNS/Bonjour
2. **Encryption**: Add TLS to WebSocket for local encryption
3. **Multiple receivers**: Send to multiple Chromebooks at once
4. **Cloud relay**: Option to use cloud server when not on same WiFi
5. **Play Store**: Publish Android receiver to Google Play

## Conclusion

By leveraging:
- Browser's ability to call external APIs
- WebSocket for local device communication
- Android's ability to paste via accessibility

We created a simple, efficient, no-hub solution that just works! 🎉
