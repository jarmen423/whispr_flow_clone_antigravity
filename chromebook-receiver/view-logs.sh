#!/bin/bash
# View Whispr Flow logs (backdoor for debugging)

LOG_DIR="$HOME/.local/share/whispr-flow"
LOG_FILE="$LOG_DIR/receiver.log"

echo "🎤 Whispr Flow - Log Viewer"
echo "============================"
echo ""

# Show log file sizes
echo "📁 Log files:"
if [ -d "$LOG_DIR" ]; then
    ls -lh "$LOG_DIR"/*.log* 2>/dev/null || echo "   No log files found"
else
    echo "   Log directory not found"
fi
echo ""

# Show recent logs
if [ -f "$LOG_FILE" ]; then
    echo "📄 Showing last 50 lines of current log:"
    echo "(Press 'q' to exit, Shift+G to jump to bottom)"
    echo ""
    tail -n 50 "$LOG_FILE" | less +G
else
    echo "❌ No log file found at: $LOG_FILE"
    echo ""
    echo "The receiver may not have been started yet."
    echo ""
    echo "To view older rotated logs, check: $LOG_DIR/"
fi
