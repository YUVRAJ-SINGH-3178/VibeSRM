@echo off
echo ========================================
echo VibeSRM Backend Setup
echo ========================================
echo.

echo [1/5] Checking PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL not found. Please install PostgreSQL 14+ first.
    echo Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo ✓ PostgreSQL found

echo.
echo [2/5] Checking Redis...
where redis-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Redis not found. Install Redis for Windows:
    echo https://github.com/microsoftarchive/redis/releases
    echo.
    echo Continue anyway? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)
echo ✓ Redis found

echo.
echo [3/5] Creating database...
psql -U postgres -c "CREATE DATABASE vibesrm;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Database created
) else (
    echo Database already exists or error occurred
)

echo.
echo [4/5] Running migrations...
psql -U postgres -d vibesrm -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run schema migration
    pause
    exit /b 1
)
echo ✓ Schema created

echo.
echo [5/5] Seeding data...
psql -U postgres -d vibesrm -f seed.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to seed data
    pause
    exit /b 1
)
echo ✓ Data seeded

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start Redis: redis-server
echo 2. Start server: npm run dev
echo.
echo Server will run on http://localhost:5000
echo.
pause
