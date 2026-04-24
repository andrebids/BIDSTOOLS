@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "BUILD_SCRIPT=%SCRIPT_DIR%scripts\build-native-plugin.ps1"

if not exist "%BUILD_SCRIPT%" (
  echo Build script not found:
  echo %BUILD_SCRIPT%
  echo.
  pause
  exit /b 1
)

echo Running BIDSTOOLS native plugin build...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%BUILD_SCRIPT%" %*
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo Build completed successfully.
) else (
  echo Build failed with exit code %EXIT_CODE%.
)

echo.
pause
exit /b %EXIT_CODE%
