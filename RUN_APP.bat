@echo off
echo 🚀 Starting VibeSRM Full Stack...

start cmd /k "cd server && npm run dev"
start cmd /k "npm run dev"

echo ✨ Servers starting!
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:5000
echo.
echo Please keep both windows open while using the app.
