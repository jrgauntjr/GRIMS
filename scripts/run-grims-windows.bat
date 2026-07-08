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
set "GRIMS_LAUNCH_URL=http://127.0.0.1:%GRIMS_PORT%/desktop/launcher"

if exist "%~dp0igdb.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%~dp0igdb.env") do (
    if not "%%A"=="" set "%%A=%%B"
  )
)

REM Open the browser once the local server is ready.
start "" /B powershell -NoProfile -WindowStyle Hidden -Command ^
  "$u='%GRIMS_LAUNCH_URL%'; $port=%GRIMS_PORT%; for ($i=0; $i -lt 120; $i++) { try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', $port); $c.Close(); Start-Process $u; exit 0 } catch { Start-Sleep -Seconds 1 } }"

"%GRIMS_BIN%"
