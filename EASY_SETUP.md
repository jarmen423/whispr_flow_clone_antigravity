# LocalFlow - Easy Setup for Non-Technical Users

This guide walks you through setting up LocalFlow without any technical knowledge.

## What You Need

- A computer (Windows, Mac, or Linux)
- A Groq API key (free to get, pay-per-use for transcription)
- Optional: An iPhone or Android phone as a remote microphone

## Step 1: Get Your Groq API Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for a free account
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Keep this key safe - you'll need it in Step 3

## Step 2: Download LocalFlow

1. Download the LocalFlow package from the releases page
2. Extract the ZIP file to a folder on your computer
3. Open the folder

## Step 3: First Time Setup

### Windows Users

1. Double-click `start-easy.bat`
2. Wait for the windows to open (this may take 10-30 seconds)
3. Your browser should open automatically
4. If it doesn't, open your browser and go to: `http://localhost:3005`

### Mac/Linux Users

1. Open Terminal
2. Navigate to the LocalFlow folder: `cd /path/to/localflow`
3. Run: `./scripts/start-easy.sh`
4. Open your browser and go to: `http://localhost:3005`

## Step 4: Configure Your API Key

1. In the LocalFlow web page, click the **Settings** icon (gear symbol)
2. Find the "Groq API Key" section
3. Paste your API key from Step 1
4. Click "Save"
5. You're ready to go!

## How to Use

### Option A: Use Your Computer's Microphone (Hotkey)

1. Make sure LocalFlow is running (you see the Web UI at localhost:3005)
2. Click in any application where you want to type (Word, Email, Slack, etc.)
3. Press and hold **Alt + V** (or **Alt + L** depending on your settings)
4. Speak clearly
5. Release the keys
6. Your text appears automatically!

### Option B: Use Your Phone as a Remote Microphone

1. Make sure LocalFlow is running on your computer
2. Find your computer's IP address:
   - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   - Mac: Open Terminal, type `ifconfig | grep inet`, look for your WiFi IP
3. On your phone, open a web browser
4. Go to: `http://YOUR_COMPUTER_IP:3005/mobile`
   - Example: `http://192.168.1.100:3005/mobile`
5. Tap the record button, speak, release
6. Text appears on your computer wherever your cursor is!

## Troubleshooting

### "No API key configured" error
- Go to Settings in the Web UI
- Enter your Groq API key
- Click Save

### "Cannot connect to server" error
- Make sure you started all services with `start-easy.bat`
- Check that the windows are still open
- Try refreshing the browser page

### "Desktop agent not running" error
- Look for a window titled "LocalFlow Agent" or similar
- If it's closed, restart by running `start-easy.bat` again

### Text doesn't appear in other applications
- Make sure the Desktop Agent is running
- Try clicking in the target application first
- Some applications (like Windows Terminal) need special paste handling - the agent handles this automatically

### Audio quality is poor
- Speak closer to your microphone
- Reduce background noise
- Check your microphone settings in your operating system

## Stopping LocalFlow

When you're done:
1. Close the browser tab
2. Close all the black/terminal windows that opened
3. Or press Ctrl+C in each window

## Updating LocalFlow

To get the latest version:
1. Download the new release
2. Extract it to a new folder (or replace the old one)
3. Run `start-easy.bat` again
4. Your API key and settings are saved and will be remembered

## Help & Support

- API Key: https://console.groq.com/keys
- LocalFlow issues: Check the GitHub issues page

---

**That's it!** You're ready to dictate anywhere on your computer. Happy typing! 🎙️
