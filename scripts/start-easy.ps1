#!/usr/bin/env pwsh
# LocalFlow Easy Start Script for Windows (PowerShell)
# This script starts all required services for non-technical users

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    LocalFlow - Starting Services" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
$checks = @(
    @{ Name = "Bun"; Command = "bun"; InstallUrl = "https://bun.sh" },
    @{ Name = "Python"; Command = "python"; InstallUrl = "https://python.org" }
)

foreach ($check in $checks) {
    $command = Get-Command $check.Command -ErrorAction SilentlyContinue
    if (-not $command) {
        Write-Host "[ERROR] $($check.Name) is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install from: $($check.InstallUrl)" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Configuration
$NextPort = 3005
$WsPort = 3002

Write-Host "[1/3] Starting WebSocket Service..." -ForegroundColor Green
$wsJob = Start-Job { Set-Location $using:PWD; bun run dev:ws }

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Next.js Server..." -ForegroundColor Green
$nextJob = Start-Job { Set-Location $using:PWD; bun run dev }

Start-Sleep -Seconds 3

Write-Host "[3/3] Starting Python Agent..." -ForegroundColor Green
$agentJob = Start-Job { 
    Set-Location (Join-Path $using:PWD "agent")
    python localflow-agent.py 
}

# Wait a moment for services to initialize
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "    All services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor White
Write-Host "  - Web UI:       http://localhost:$NextPort" -ForegroundColor Cyan
Write-Host "  - WebSocket:    ws://localhost:$WsPort" -ForegroundColor Cyan
Write-Host "  - Python Agent: Desktop hotkey (Alt+V)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To configure your Groq API key:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:$NextPort" -ForegroundColor White
Write-Host "  2. Click Settings (gear icon)" -ForegroundColor White
Write-Host "  3. Enter your API key" -ForegroundColor White
Write-Host ""
Write-Host "Get your API key at: https://console.groq.com/keys" -ForegroundColor Magenta
Write-Host ""

$openBrowser = Read-Host "Open Web UI in browser? (Y/n)"
if ($openBrowser -ne "n") {
    Start-Process "http://localhost:$NextPort"
}

Write-Host ""
Write-Host "Services are running in background jobs." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow
Write-Host ""

# Keep script running and show job status
try {
    while ($true) {
        $jobs = Get-Job
        $running = ($jobs | Where-Object { $_.State -eq "Running" }).Count
        if ($running -eq 0) {
            Write-Host "`nAll services have stopped." -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 5
    }
} finally {
    # Cleanup
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -ErrorAction SilentlyContinue
}
