#!/bin/bash
# Setup script for Whispr Chromebook (Standalone - no iPhone needed)
# SEPARATE from the receiver setup to avoid conflicts

set -e

echo "🎙️ Setting up Whispr Chromebook (Standalone)..."

# Fix line endings if this script was copied from Windows
# Remove carriage returns from the script itself and related files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Convert CRLF to LF for the Python script if needed
if file "$SCRIPT_DIR/whispr-chromebook.py" | grep -q "CRLF"; then
    echo "📝 Converting Windows line endings to Linux..."
    sed -i 's/\r$//' "$SCRIPT_DIR/whispr-chromebook.py"
fi

# Install dependencies (standalone needs tkinter and alsa-utils)
echo "📦 Installing dependencies..."
sudo apt-get update
sudo apt-get install -y xclip alsa-utils python3-tk

# Create directories
mkdir -p "$HOME/.local/share/applications"
mkdir -p "$HOME/.config/whispr-flow"
mkdir -p "$HOME/Desktop"

echo "🖥️  Creating desktop shortcut..."

# Standalone app desktop entry
DESKTOP_FILE="$HOME/Desktop/Whispr-Chromebook.desktop"

# Create the desktop file (using printf to avoid line ending issues)
printf '%s\n' "[Desktop Entry]" > "$DESKTOP_FILE"
printf '%s\n' "Name=🎙️ Whispr Chromebook" >> "$DESKTOP_FILE"
printf '%s\n' "Comment=Record and transcribe directly on Chromebook (no iPhone needed)" >> "$DESKTOP_FILE"
printf '%s\n' "Exec=python3 $SCRIPT_DIR/whispr-chromebook.py" >> "$DESKTOP_FILE"
printf '%s\n' "Type=Application" >> "$DESKTOP_FILE"
printf '%s\n' "Terminal=false" >> "$DESKTOP_FILE"
printf '%s\n' "Icon=audio-input-microphone" >> "$DESKTOP_FILE"
printf '%s\n' "Categories=AudioVideo;Audio;" >> "$DESKTOP_FILE"
printf '%s\n' "StartupNotify=true" >> "$DESKTOP_FILE"
printf '%s\n' "Path=$SCRIPT_DIR" >> "$DESKTOP_FILE"

# Make executable
chmod +x "$DESKTOP_FILE"

# Also add to applications menu
cp "$DESKTOP_FILE" "$HOME/.local/share/applications/"

echo ""
echo "✅ Whispr Chromebook installed!"
echo ""
echo "═══════════════════════════════════════════════════"
echo "  🎙️ WHISPR CHROMEBOOK (Standalone)"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Use when you DON'T have your iPhone."
echo "  Records directly on Chromebook, transcribes via Groq,"
echo "  and copies to clipboard."
echo ""
echo "  🎙️ Whispr Chromebook   - Desktop icon created"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo "💡 First time use:"
echo "   1. Double-click 🎙️ Whispr Chromebook"
echo "   2. Enter your Groq API key"
echo "   3. Click START RECORDING"
echo "   4. Speak, then click STOP"
echo "   5. Text is copied to clipboard!"
echo ""
echo "⚙️  Config saved to: ~/.config/whispr-flow/"
echo ""
