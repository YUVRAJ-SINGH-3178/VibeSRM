@echo off
echo 🚀 Starting VibeSRM Full Stack...

start cmd /k "cd server && npm run dev"
start cmd /k "npm run dev"

echo ✨ Servers starting!
echo.
echo 🏠 [LOCAL ACCESS]
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:5000
echo.
echo 👥 [SHARE WITH OTHERS]
echo 1. Check your IP address (run 'ipconfig' in cmd)
echo 2. Tell them to visit: http://YOUR_IP:5173
echo.
echo ⚠️  Still "Failed to Fetch"? 
echo Run ALLOW_PORTS.ps1 as Administrator!
echo.
echo Please keep both windows open while using the app.
