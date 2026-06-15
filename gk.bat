@echo off
setlocal

:: If a command was passed directly (e.g. gk start), run it without showing the menu
if not "%1"=="" (
    if "%1"=="start"   goto :start
    if "%1"=="stop"    goto :stop
    if "%1"=="restart" goto :restart
    if "%1"=="build"   goto :build
    if "%1"=="test"    goto :test
    if "%1"=="migrate" goto :migrate
    if "%1"=="logs"    goto :logs
    echo Unknown command: %1
    goto :menu
)

:: ─── MENU ─────────────────────────────────────────────────────────────────────
:menu
cls
echo.
echo  ============================================================
echo    GigKraft Dev Tools
echo  ============================================================
echo.
echo    [1]  Start    - Start backend + frontend
echo    [2]  Stop     - Stop backend + frontend
echo    [3]  Restart  - Stop then start both servers
echo    [4]  Build    - Production build of frontend
echo    [5]  Test     - Run backend test suite
echo    [6]  Migrate  - Run Django migrations
echo    [7]  Logs     - Open backend + frontend log windows
echo    [0]  Exit
echo.
set /p CHOICE="  Choose an option: "

if "%CHOICE%"=="1" goto :start
if "%CHOICE%"=="2" goto :stop
if "%CHOICE%"=="3" goto :restart
if "%CHOICE%"=="4" goto :build
if "%CHOICE%"=="5" goto :test
if "%CHOICE%"=="6" goto :migrate
if "%CHOICE%"=="7" goto :logs
if "%CHOICE%"=="0" goto :eof

echo  Invalid option. Press any key to try again...
pause >nul
goto :menu

:: ─── START ────────────────────────────────────────────────────────────────────
:start
echo.
echo  [GigKraft] Starting backend...
start "GK-Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate && set DJANGO_SETTINGS_MODULE=config.settings.local&& .venv\Scripts\python manage.py runserver 8000"

echo  [GigKraft] Starting frontend...
start "GK-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Both servers started:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo    API docs: http://localhost:8000/api/docs
echo.
if "%1"=="" (pause & goto :menu)
goto :eof

:: ─── STOP ─────────────────────────────────────────────────────────────────────
:stop
echo.
echo  [GigKraft] Stopping servers...
taskkill /FI "WindowTitle eq GK-Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq GK-Frontend*" /F >nul 2>&1

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8000 "') do (
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%p /F >nul 2>&1
)
echo  [GigKraft] Servers stopped.
echo.
if "%1"=="" (pause & goto :menu)
goto :eof

:: ─── RESTART ──────────────────────────────────────────────────────────────────
:restart
call "%~f0" stop
echo  [GigKraft] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
call "%~f0" start
goto :eof

:: ─── BUILD ────────────────────────────────────────────────────────────────────
:build
echo.
echo  [GigKraft] Building frontend for production...
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
    echo.
    echo  [GigKraft] Build FAILED.
    echo.
    if "%1"=="" (pause & goto :menu)
    exit /b 1
)
echo.
echo  [GigKraft] Build complete. Output in frontend\dist\
echo.
if "%1"=="" (pause & goto :menu)
goto :eof

:: ─── TEST ─────────────────────────────────────────────────────────────────────
:test
echo.
echo  [GigKraft] Running backend tests...
cd /d "%~dp0backend"
call .venv\Scripts\python manage.py test --verbosity=2
echo.
if "%1"=="" (pause & goto :menu)
goto :eof

:: ─── MIGRATE ──────────────────────────────────────────────────────────────────
:migrate
echo.
echo  [GigKraft] Running Django migrations...
cd /d "%~dp0backend"
call .venv\Scripts\activate
set DJANGO_SETTINGS_MODULE=config.settings.local
call .venv\Scripts\python manage.py migrate
echo.
echo  [GigKraft] Migrations complete.
echo.
if "%1"=="" (pause & goto :menu)
goto :eof

:: ─── LOGS ─────────────────────────────────────────────────────────────────────
:logs
echo.
echo  [GigKraft] Opening log windows...
start "GK-Backend-Logs" cmd /k "cd /d "%~dp0backend" && echo Watching backend logs... && .venv\Scripts\python manage.py runserver 8000 2>&1"
start "GK-Frontend-Logs" cmd /k "cd /d "%~dp0frontend" && npm run dev 2>&1"
echo  Log windows opened.
echo.
if "%1"=="" (pause & goto :menu)
goto :eof
