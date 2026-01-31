# Build and Share APK - Quick Guide

This guide shows you how to build the Android Receiver APK and share it with friends.

## Prerequisites

- **Android Studio** installed on your computer
  - Download: https://developer.android.com/studio
- This repo cloned to your computer

## Step 1: Open Project in Android Studio

1. Launch **Android Studio**
2. Click **"Open"** (not "New Project")
3. Navigate to: `[your-repo-path]/android-receiver`
4. Click **OK**
5. Wait for Gradle sync (2-5 minutes, progress shown in bottom bar)

## Step 2: Build the APK

### Method A: Using Android Studio UI

1. Click **Build** in top menu bar
2. Click **Build Bundle(s) / APK(s)**
3. Click **Build APK(s)**
4. Wait for build to complete (bottom status bar shows progress)
5. When done, a notification appears in bottom-right corner
6. Click the **"locate"** link in the notification

### Method B: Using Terminal

```bash
cd android-receiver
./gradlew assembleDebug
```

## Step 3: Find the APK File

The APK is located at:
```
android-receiver/app/build/outputs/apk/debug/app-debug.apk
```

**File size:** ~3-5 MB

## Step 4: Share the APK

### Option 1: Email
1. Attach `app-debug.apk` to an email
2. Send to your friend
3. They download on their Chromebook

### Option 2: Google Drive / Dropbox
1. Upload `app-debug.apk` to cloud storage
2. Share the download link
3. Friend downloads on Chromebook

### Option 3: USB Drive
1. Copy `app-debug.apk` to USB drive
2. Plug into Chromebook
3. Copy file to Chromebook Downloads

## Step 5: Friend Installs on Chromebook

### Enable Unknown Sources (One-time setup)

1. On Chromebook, open **Settings**
2. Go to **Apps** → **Google Play Store** → **Manage Android preferences**
3. Go to **Security & privacy**
4. Enable **"Unknown sources"** or **"Install unknown apps"**
   - May need to enable for Files app or Browser

### Install the APK

1. Open **Files** app on Chromebook
2. Find `app-debug.apk` (in Downloads)
3. **Double-click** the APK file
4. Tap **Install**
5. Tap **Open** when done

## Step 6: Setup Complete!

Your friend now has the LocalFlow Receiver app installed.

**Next steps:**
1. They open the app
2. Tap "Start Receiver"
3. Note the IP address shown
4. You enter that IP in your iPhone PWA settings
5. Start dictating!

## Troubleshooting

### "Install blocked" error
- Make sure "Unknown sources" is enabled in Android settings
- Try enabling it specifically for the Files app

### "Parse error" or "App not installed"
- APK may be corrupted during transfer
- Rebuild and resend

### "App from unknown developer" warning
- This is normal for sideloaded apps
- Tap "Install anyway" or "Continue"

## Rebuilding After Changes

If you update the code:

1. Make changes in Android Studio
2. Click **Build** → **Rebuild Project**
3. Or: `./gradlew clean assembleDebug`
4. New APK will be in same location
5. Share the new APK

## Alternative: Release APK (Smaller, Optimized)

For a smaller, optimized APK:

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Choose **APK**
3. Create or select a keystore (for signing)
4. Select **release** build type
5. File will be at: `app/build/outputs/apk/release/app-release.apk`

**Note:** Release APK requires code signing, which is more complex. Debug APK is fine for personal use.

## Summary

| Step | Action |
|------|--------|
| 1 | Open `android-receiver` in Android Studio |
| 2 | Build → Build APK(s) |
| 3 | Find APK in `build/outputs/apk/debug/` |
| 4 | Share `app-debug.apk` with friend |
| 5 | Friend enables "Unknown sources" and installs |
| 6 | Done! |

**Total time:** ~5-10 minutes first time, ~2 minutes for rebuilds.
