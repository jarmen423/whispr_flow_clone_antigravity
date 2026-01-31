# iPhone to Chromebook Setup Guide

This guide shows you how to use your iPhone as a microphone to dictate text directly onto your Chromebook (or Android device).

## How It Works

```
iPhone (PWA)                              Chromebook (Android App)
├─ Record audio                           ├─ WebSocket SERVER
├─ Call Groq API directly                 │   (waits for connection)
│   (iPhone → Groq cloud)                 │
├─ Get text back (~500ms)                 │
├─ Send TEXT via WebSocket ───────────────┼─► Receive text
│   (tiny 1KB transfer!)                  └─ Paste to active app
└─ Done!
```

**Key Point**: Audio goes directly from iPhone to Groq's cloud service. Only the transcribed text travels over your local WiFi to the Chromebook.

## What You Need

1. **iPhone** with Safari (iOS 14+)
2. **Chromebook** with Android app support (most modern Chromebooks)
3. **Groq API key** (free at https://console.groq.com/keys)
4. Both devices on the **same WiFi network**

## Setup Instructions

### Step 1: Get Your Groq API Key

1. On your iPhone or computer, go to https://console.groq.com/keys
2. Sign up for free account
3. Create an API key (starts with `gsk_`)
4. Copy and save it somewhere safe

### Step 2: Install Android Receiver on Chromebook

**Option A: Developer Mode (ADB)**

1. Enable Linux on your Chromebook (Settings → Advanced → Developers → Linux)
2. Open Terminal
3. Enable ADB: `sudo apt install adb`
4. Enable Developer Mode on Android container (Settings → Apps → Google Play Store → Manage Android preferences → About → Tap Build Number 7 times)
5. Enable USB debugging
6. Connect via ADB and install APK

**Option B: Google Play Store (Future)**
Once published, simply search "LocalFlow Receiver" on Play Store and install.

### Step 3: Start the Receiver App

1. Open the LocalFlow Receiver app on your Chromebook
2. Tap "Start Receiver"
3. Note the IP address shown (e.g., `192.168.1.50`)
4. Keep the app running

### Step 4: Set Up iPhone PWA

1. On your iPhone, open Safari
2. Go to: `http://[CHROMEBOOK_IP]:3005/mobile`
   - Replace [CHROMEBOOK_IP] with the IP from Step 3
   - Example: `http://192.168.1.50:3005/mobile`
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "LocalFlow Mic" and tap Add

### Step 5: Configure the iPhone App

1. Open the "LocalFlow Mic" app from your home screen
2. Tap **Settings** (gear icon)
3. Enter your **Groq API key**
4. Enter your **Chromebook IP address** (from Step 3)
5. Select your preferred **Refinement Mode**
6. Tap **Save**

### Step 6: Use It!

1. On your Chromebook, open the app where you want to type (Docs, Gmail, etc.)
2. On your iPhone, open LocalFlow Mic
3. Tap the big **record button**
4. Speak clearly
5. Tap the button again to stop
6. The text appears on your Chromebook!

## How to Find Your Chromebook's IP Address

### In the Receiver App
The app displays it when you start the server (e.g., `192.168.1.50`)

### Manual Method
1. On Chromebook, open Settings
2. Go to Network → WiFi
3. Tap your connected network
4. Look for "IP address"

## Troubleshooting

### "Cannot connect to receiver"
- Make sure both devices are on the same WiFi network
- Check that the Chromebook IP address is correct
- Verify the Receiver app is running (showing "Server running")

### "Groq API error"
- Check that your API key is entered correctly
- Verify the key starts with `gsk_`
- Make sure you have credits in your Groq account

### "Text appears on iPhone but not Chromebook"
- Check Chromebook notification permissions for the Receiver app
- Make sure the app has "Display over other apps" permission
- Try enabling Accessibility Service in the Receiver app

### "Audio quality is poor"
- Hold the iPhone closer to your mouth
- Reduce background noise
- Speak at a normal pace

## Security Notes

- Your Groq API key is stored **only on your iPhone** (in browser localStorage)
- Audio is sent **directly** from iPhone to Groq (not through any intermediate server)
- Only transcribed text travels over your local WiFi
- No data is stored on any servers except Groq's API

## Alternative: Computer as Hub

If you prefer, you can also use a Windows/Mac/Linux computer as the hub:

1. Run `./scripts/start-easy.ps1` on your computer
2. Use computer's IP address in the iPhone PWA
3. Chromebook can connect as a receiver too

This is useful if you want to use multiple receivers or have the computer handle the processing.

## Questions?

- Groq issues: https://console.groq.com
- LocalFlow issues: Check the GitHub repository
