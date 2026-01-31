# Android Receiver App - Setup & Build

## Overview
This Android app receives dictation from LocalFlow and pastes it into any Android app (including Chromebook apps).

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17 or newer
- Android SDK with API 34

## Project Structure

```
android-receiver/
├── app/
│   ├── build.gradle.kts          # App build config
│   ├── src/main/
│   │   ├── AndroidManifest.xml   # App manifest
│   │   ├── java/com/localflow/receiver/
│   │   │   ├── MainActivity.kt           # Main UI
│   │   │   ├── ReceiverService.kt        # WebSocket connection
│   │   │   └── LocalFlowAccessibilityService.kt  # Auto-paste
│   │   ├── res/
│   │   │   ├── layout/activity_main.xml
│   │   │   ├── values/strings.xml
│   │   │   └── xml/accessibility_service_config.xml
│   │   └── (mipmap icons would go here)
│   └── proguard-rules.pro
├── build.gradle.kts              # Project build config
├── settings.gradle.kts           # Project settings
└── README.md
```

## Build Instructions

### 1. Open in Android Studio

1. Launch Android Studio
2. Click "Open" and select the `android-receiver` folder
3. Wait for Gradle sync to complete

### 2. Build Debug APK

```bash
# In Android Studio Terminal, or use the Build menu:
./gradlew assembleDebug
```

APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

### 3. Install on Device

```bash
# Connect device via USB with USB debugging enabled
adb install app/build/outputs/apk/debug/app-debug.apk
```

Or use Android Studio's "Run" button.

## Usage

1. **Start LocalFlow on your computer**:
   ```bash
   bun run dev:all
   ```

2. **Find your computer's IP address**:
   - Windows: `ipconfig`
   - Mac: `ifconfig | grep inet`
   - Linux: `ip addr`

3. **Open the Android Receiver app**

4. **Enter the server URL**:
   - Format: `http://YOUR_COMPUTER_IP:3002`
   - Example: `http://192.168.1.100:3002`

5. **Tap "Start Receiver"**

6. **(Optional) Enable Accessibility Service**:
   - Tap "Enable Auto-Paste"
   - Go to Settings > Accessibility > LocalFlow Receiver
   - Toggle ON
   - This allows automatic pasting into any app

7. **On your sender device** (iPhone, Android phone, or web browser):
   - Open LocalFlow
   - Record audio
   - Text will appear on your Android/Chromebook device!

## How It Works

```
Sender Device (iPhone/Android/Web)
    ↓ WebSocket (/mobile, /web)
LocalFlow WebSocket Service (Port 3002)
    ↓ WebSocket (/receiver namespace)
Android Receiver App
    ↓ Accessibility Service OR Clipboard
Target App (Chrome, Docs, any text field)
```

## Pasting Methods

The app tries multiple methods to paste text:

1. **Accessibility Service** (if enabled):
   - Detects focused text input
   - Injects text directly
   - Most reliable, requires permission

2. **Clipboard + Notification**:
   - Copies text to clipboard
   - Shows notification
   - User can manually paste

3. **Floating Action Button** (future):
   - Shows overlay button
   - Tap to paste at cursor

## Chromebook Specific Notes

- Works in Android container on Chrome OS
- Accessibility Service works with Chrome OS apps
- May need to enable "Unknown Sources" in Chrome OS settings

## Troubleshooting

### "Connection failed"
- Check that computer and Android device are on same WiFi
- Verify the IP address is correct
- Check that firewall allows port 3002

### "Cannot paste automatically"
- Enable Accessibility Service in Android settings
- Some apps (banking apps) block accessibility for security

### "No notification shown"
- Grant notification permission in Android settings
- For Android 13+, this is required

## Future Enhancements

1. **Floating paste button** - Overlay button for manual paste
2. **Auto-discovery** - Find LocalFlow server automatically
3. **Multiple receivers** - Select which device to send to
4. **Encryption** - Secure WebSocket connections
5. **Google Play Store** - Official release

## Development

To modify the app:
1. Open in Android Studio
2. Make changes to Kotlin files
3. Rebuild with `./gradlew assembleDebug`
4. Test on device

## License
Same as main LocalFlow project
