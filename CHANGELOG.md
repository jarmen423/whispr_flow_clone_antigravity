# Changelog

All notable changes to LocalFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### Added

- Initial release of LocalFlow
- Web UI with recording interface and audio visualization
- Real-time WebSocket communication between browser and desktop agent
- Cloud processing mode for fast transcription (demo implementation)
- Local processing mode support (Whisper.cpp + Ollama)
- Desktop Python agent with global hotkey support
- Four refinement modes: Developer, Concise, Professional, Raw
- Dictation history with local storage persistence
- Settings management with localStorage
- Auto-copy to clipboard functionality
- Sound effects for recording events
- shadcn/ui component library integration
- Framer Motion animations
- Dark mode by default
- Comprehensive setup guide and documentation

### Technical Details

- Next.js 15 with App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 3
- Socket.IO 4.8 for WebSocket communication
- Python 3.7+ desktop agent
- Bun runtime for development

### Security

- Input validation for all API endpoints
- Rate limiting on WebSocket connections
- Audio size limits (5MB max)
- Text length limits (10,000 characters)
- CORS configuration
- Path traversal prevention in temp files

## [Unreleased]

### Planned

- Real cloud ASR integration (z-ai-web-dev-sdk)
- Voice activity detection (auto-stop on silence)
- Noise suppression for local transcription
- Custom system prompts for LLM refinement
- Multi-language support
- Browser extension
- VS Code extension
- Mobile app (React Native)
