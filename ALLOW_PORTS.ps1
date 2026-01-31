# Run this script as Administrator to allow VibeSRM ports through the firewall
Write-Host "🔧 Opening Firewall ports for VibeSRM..." -ForegroundColor Cyan

# Allow Port 5000 (Backend)
New-NetFirewallRule -DisplayName "VibeSRM Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

# Allow Port 5173 (Frontend)
New-NetFirewallRule -DisplayName "VibeSRM Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "✅ Ports 5000 and 5173 are now open for other devices on your network!" -ForegroundColor Green
Write-Host "🚀 Please restart the servers using RUN_APP.bat" -ForegroundColor Yellow
