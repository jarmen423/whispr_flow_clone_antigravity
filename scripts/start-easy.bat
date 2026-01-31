@echo off
REM LocalFlow Easy Start Script for Windows
REM This script starts all required services for non-technical users

echo.
echo ============================================
echo    LocalFlow - Starting Services
echo ============================================
echo.

REM Check if bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Bun is not installed or not in PATH
    echo Please install Bun from https://bun.sh
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Set default ports
set NEXT_PORT=3005
set WS_PORT=3002

echo [1/3] Starting WebSocket Service...
start "LocalFlow WebSocket" bun run dev:ws

REM Wait for WebSocket to start
timeout /t 2 /nobreak >nul

echo [2/3] Starting Next.js Server...
start "LocalFlow Web UI" bun run dev

REM Wait for Next.js to start
timeout /t 3 /nobreak >nul

echo [3/3] Starting Python Agent...
start "LocalFlow Agent" cmd /k "cd agent && python localflow-agent.py"

echo.
echo ============================================
echo    All services started!
echo ============================================
echo.
echo Services running:
echo   - Web UI:       http://localhost:%NEXT_PORT%
echo   - WebSocket:    ws://localhost:%WS_PORT%
echo   - Python Agent: Desktop hotkey (Alt+V)
echo.
echo To configure your Groq API key:
echo   1. Open http://localhost:%NEXT_PORT%
echo   2. Click Settings (gear icon)
echo   3. Enter your API key
echo.
echo Get your API key at: https://console.groq.com/keys
echo.
echo Press any key to open the Web UI...
pause >nul

start http://localhost:%NEXT_PORT%
