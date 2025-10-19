@echo off
echo ========================================
echo Building Testing AAB for Seeding
echo ========================================
echo.

REM Step 1: Run expo prebuild
echo Step 1: Running expo prebuild...
call npx expo prebuild
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Expo prebuild failed!
    msg "%username%" "AAB Build Failed at prebuild step! Check terminal for details."
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Navigating to android directory...
echo ========================================
cd E:\Siddhant\Projects\ai-projects\Seeding\android

REM Step 3: Build AAB
echo.
echo ========================================
echo Step 3: Building AAB (assembleRelease)...
echo This may take several minutes...
echo ========================================
echo.
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Your testing AAB is located at:
    echo android/app/build/outputs/bundle/release/app-release.aab
    echo.
    echo Opening AAB folder...
    start "" "E:\Siddhant\Projects\ai-projects\Seeding\android\app\build\outputs\bundle\release"
    echo.
    msg "%username%" "AAB Build Complete! Your testing AAB is ready at: android/app/build/outputs/bundle/release/app-release.aab"
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    msg "%username%" "AAB Build Failed! Please check the terminal for error details."
)

REM Return to root directory
cd ..

pause
