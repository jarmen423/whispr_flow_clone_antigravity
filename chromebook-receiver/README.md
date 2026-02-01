# Whispr Flow - Chromebook Receiver

Receive voice transcriptions from your iPhone on a Chromebook - two ways!

---

## 🚀 Quick Start (Linux Mode)

### Prerequisites
Enable Linux on Chromebook:
```
Settings → Advanced → Developers → Linux development environment → ON
Wait for installation (~10 min)
```

### One-Time Setup
1. Copy the `chromebook-receiver` folder to your Chromebook
2. Open **Linux terminal**
3. Run:
   ```bash
   cd ~/chromebook-receiver
   bash setup.sh
   ```

### Daily Use
You'll have **3 desktop icons**:

| Icon | Use When... |
|------|-------------|
| 🎤 **Whispr Flow** | Normal use - runs silently in background |
| 🐛 **Whispr Flow (Debug)** | Something's wrong - shows live logs in terminal |
| 📋 **Whispr Flow Logs** | Check what happened earlier - view log history |

**For your friend:** Just double-click 🎤 **Whispr Flow**, then:
1. Open Chrome to `http://localhost:3005` to see the pretty status page
2. Note the IP address shown
3. iPhone: Open Safari → `http://[IP]:3005/mobile`
4. Start recording!

**For you (debugging):** Double-click 🐛 **Whispr Flow (Debug)** to see live logs, or 📋 **Whispr Flow Logs** to view history.

---

## 🌐 Web Browser Option (Alternative)

Don't want Linux? Just use the browser version:

1. Copy `web-clipboard-receiver.html` to Chromebook
2. Double-click to open in Chrome
3. Note: Still requires the Python server to be running for WebSocket

**Recommendation:** Use the Linux version - it's more reliable and has better clipboard support.

---

## 🔧 How It Works

```
iPhone (records audio → sends to Groq API → gets text)
    ↓ WebSocket (text only)
Chromebook (Linux receiver)
    ↓ xclip/wl-copy
System clipboard
    ↓ Paste anywhere with Ctrl+V!
```

---

## 🐛 Troubleshooting

### "Nothing happens when I click the icon"
- Check if it's already running (look for 🎤 in system tray)
- Click 🐛 **Whispr Flow (Debug)** to see error messages
- Or click 📋 **Whispr Flow Logs** to check logs

### "Cannot connect from iPhone"
- Make sure both devices are on the **same WiFi**
- Check the IP address on the status page (`http://localhost:3005`)
- Try refreshing the iPhone page
- Check 🐛 Debug mode for connection messages

### "Clipboard not working"
```bash
# In Linux terminal:
sudo apt install xclip wl-clipboard
```

### "Port already in use"
```bash
# Kill existing process:
pkill -f linux-receiver.py
# Or check logs to see if it's already running
```

### "Permission denied"
```bash
# Make scripts executable:
chmod +x ~/chromebook-receiver/*.sh
chmod +x ~/chromebook-receiver/*.py
```

---

## 📁 File Structure

| File | Purpose |
|------|---------|
| `linux-receiver.py` | Main receiver (handles WebSocket + web UI) |
| `web-clipboard-receiver.html` | Pretty status page shown in browser |
| `setup.sh` | One-time setup - creates desktop icons |
| `view-logs.sh` | Helper to view log files |
| `README.md` | This file |

### Log Location
```
~/.local/share/whispr-flow/receiver.log
```

---

## 🔄 Auto-Start (Optional)

To start automatically when Linux boots:

```bash
# Add to crontab
crontab -e

# Add this line:
@reboot sleep 10 && /usr/bin/python3 /home/USERNAME/chromebook-receiver/linux-receiver.py
```

---

## 📝 Notes for Developers

The receiver uses:
- **WebSocket** (port 3002) - receives text from iPhone
- **HTTP** (port 3005) - serves status page
- **xclip/wl-copy** - copies to system clipboard

Debug mode: `python3 linux-receiver.py --debug`
Silent mode: `python3 linux-receiver.py` (default)

Logs are always written to `~/.local/share/whispr-flow/receiver.log` regardless of mode.
