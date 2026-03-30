@echo off
REM Build script for SUB INFRA Panel

echo Building SUB INFRA Panel...

REM Remove old dist folder
if exist dist (
    rmdir /s /q dist
)

REM Create new dist folder
mkdir dist

REM Copy main files
echo Copying main files...
copy index.html dist\ >nul 2>&1
copy 2026_script.js dist\ >nul 2>&1
copy pwa-handler.js dist\ >nul 2>&1
copy ui-kit.css dist\ >nul 2>&1
copy ui-kit.js dist\ >nul 2>&1
copy manifest.json dist\ >nul 2>&1
copy sw.js dist\ >nul 2>&1
copy _redirects dist\ >nul 2>&1
copy icone_logo.png dist\ >nul 2>&1

REM Copy directories
echo Copying directories...
if exist icons xcopy icons dist\icons\ /E /I /Q >nul 2>&1
if exist public xcopy public dist\public\ /E /I /Q >nul 2>&1

echo Build complete! Files are in dist\ folder.
pause
