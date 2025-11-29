@echo off
chcp 65001
cls
echo ========================================================
echo       Amazon Auto-Filler Local Server
echo ========================================================
echo.
echo [1/3] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python first.
    echo Download: https://www.python.org/downloads/
    pause
    exit /b
)
echo [OK] Python found.

echo.
echo [2/3] Starting local server on port 8000...
echo.
echo [IMPORTANT]
echo 1. Keep this window OPEN while using the extension.
echo 2. Ensure 'amazon_full_test_data.csv' and images are in this folder.
echo.
echo Server is running at: http://localhost:8000/
echo.

python -m http.server 8000

pause
