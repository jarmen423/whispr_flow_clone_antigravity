#!/bin/bash
# View Whispr Flow logs (backdoor for debugging)

LOG_FILE="$HOME/.local/share/whispr-flow/receiver.log"

echo "🎤 Whispr Flow - Log Viewer"
echo "============================"
echo ""

if [ -f "$LOG_FILE" ]; then
    echo "📄 Showing last 50 lines of logs:"
    echo "(Press 'q' to exit)"
    echo ""
    tail -n 50 "$LOG_FILE" | less
else
    echo "❌ No log file found at: $LOG_FILE"
    echo ""
    echo "The receiver may not have been started yet."
fi
