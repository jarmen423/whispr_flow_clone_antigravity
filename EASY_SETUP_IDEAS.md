# Making LocalFlow Non-Techy Friendly

## Current Pain Points

### 1. API Key Management
**Current:** Edit `.env` file, restart server
**Needed:** In-app API key input

```typescript
// New API endpoint: /api/settings/api-key
// Store encrypted in localStorage or server session

// New UI component in Settings:
┌─────────────────────────────────┐
│ Groq API Key                    │
│ ┌─────────────────────────────┐ │
│ │ gsk_•••••••••••••••••••••• │ │
│ └─────────────────────────────┘ │
│ [Save Key]  [Use Free Mode]     │
└─────────────────────────────────┘
```

### 2. Desktop Agent Distribution
**Current:** Python script + pip install
**Needed:** Packaged app

**Options:**
- **PyInstaller** → Single .exe/.app file
- **Tauri** → Rust-based, smaller binary
- **Electron** → Larger but familiar

**Auto-start:**
- Windows: Registry / Startup folder
- macOS: LaunchAgents
- Linux: systemd

### 3. Network Discovery
**Current:** User must find IP address manually
**Needed:** Auto-discovery

```
Desktop Agent broadcasts: "I'm at 192.168.1.100:3002"
Mobile app discovers: "Found desktop!"
```

### 4. One-Command Setup Script

```powershell
# setup.ps1 - Run as non-techy user
Write-Host "🎙️ Setting up LocalFlow..."

# Check Node.js
# Install Bun
# npm install
# Create .env with defaults
# Build desktop agent
# Create startup shortcut

Write-Host "✅ Done! Opening browser..."
Start-Process "http://localhost:3005"
```

## Simplified Architecture for Non-Techy Users

```
┌─────────────────────────────────────────────────────────────┐
│  USER DEVICE (iOS/Android)                                   │
│  • PWA with simple setup wizard                             │
│  • Scan QR code to connect to desktop                       │
│  • Record → Send → Result appears on desktop                │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket (auto-discovered IP)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DESKTOP COMPUTER                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Packaged Desktop App (Electron/Tauri)               │   │
│  │ • Embedded Next.js server                          │   │
│  │ • Embedded WebSocket server                        │   │
│  │ • System tray icon                                 │   │
│  │ • Settings UI (including API key input)            │   │
│  │ • Auto-updater                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Global Hotkey Listener (native)                     │   │
│  │ • Alt+V to record from desktop mic                  │   │
│  │ • Or receive from mobile device                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Priority

### Phase 1: API Key in UI (Easiest)
- [ ] Add `apiKey` field to Settings interface
- [ ] Create `/api/settings/validate-key` endpoint
- [ ] Modify transcribe/refine routes to accept per-request API key
- [ ] Store encrypted in localStorage

### Phase 2: Packaged Desktop App
- [ ] Package with Tauri or PyInstaller
- [ ] System tray integration
- [ ] Auto-start on login
- [ ] Auto-updater

### Phase 3: Mobile Improvements
- [ ] QR code pairing (no IP typing)
- [ ] Wake lock during recording
- [ ] Better offline handling

## Alternative: Cloud-Hosted Version

For truly non-techy users, consider:
- Host the Next.js server in the cloud
- Users just install desktop agent (paste-only)
- Mobile connects to cloud
- Pay-per-use with Stripe integration
