@echo off
REM Create Windows launcher app

echo Creating Windows launcher...

REM Create launcher script
(
echo @echo off
echo echo Starting Inventory System...
echo echo.
echo echo Starting backend server...
echo cd /d "%~dp0backend"
echo call venv\Scripts\activate.bat
echo start /B uvicorn app.main:app --port 8000 ^> ..\backend.log 2^>^&1
echo timeout /t 3 /nobreak ^>nul
echo.
echo echo Starting frontend server...
echo cd /d "%~dp0frontend"
echo start /B npm run dev ^> ..\frontend.log 2^>^&1
echo timeout /t 5 /nobreak ^>nul
echo.
echo echo Opening browser...
echo start http://localhost:3000
echo.
echo echo Inventory System is running!
echo echo Frontend: http://localhost:3000
echo echo Backend: http://localhost:8000
echo echo.
echo echo Close this window to stop servers.
echo pause
) > "Start Inventory System.bat"

echo.
echo ✅ Windows launcher created: "Start Inventory System.bat"
echo.
echo To use:
echo   1. Double-click "Start Inventory System.bat"
echo   2. Wait for servers to start
echo   3. Browser will open automatically
echo.
echo To share:
echo   1. Zip the entire project folder
echo   2. Send the zip file
echo   3. Recipient extracts and runs "Start Inventory System.bat"
echo.
