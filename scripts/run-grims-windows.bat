@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0grims_windows.exe" (
  echo error: grims_windows.exe not found in %~dp0
  exit /b 1
)

set "GRIMS_HOME=%~dp0"
set "GRIMS_BIN=%~dp0grims_windows.exe"
set "GRIMS_DESKTOP=1"
set "GRIMS_BUNDLE_POSTGRES=1"
set "GRIMS_PORT=4000"
set "GRIMS_URL=http://127.0.0.1:%GRIMS_PORT%/"

echo Starting GRIMS...
echo Open %GRIMS_URL% in your browser once startup finishes.
echo Use http://127.0.0.1:%GRIMS_PORT% (not https://localhost).
echo First startup can take 30-60 seconds while PostgreSQL initializes.
echo Close this window or press Ctrl+C to stop GRIMS.
echo.

REM Wait for the server port, then open the browser. Ignore failures.
start "" /B cmd /c "powershell -NoProfile -Command \"$u='%GRIMS_URL%'; for ($i=0; $i -lt 120; $i++) { try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', %GRIMS_PORT%); $c.Close(); Start-Process $u; exit 0 } catch { Start-Sleep -Seconds 1 } }\""

"%GRIMS_BIN%"
