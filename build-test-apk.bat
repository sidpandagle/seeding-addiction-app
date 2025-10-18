@echo off
echo ========================================
echo Building Testing APK for Seeding
echo ========================================
echo.

REM Step 1: Run expo prebuild
echo Step 1: Running expo prebuild...
call npx expo prebuild
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Expo prebuild failed!
    msg "%username%" "APK Build Failed at prebuild step! Check terminal for details."
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Navigating to android directory...
echo ========================================
cd E:\Siddhant\Projects\ai-projects\Seeding\android

REM Step 3: Build APK
echo.
echo ========================================
echo Step 3: Building APK (assembleRelease)...
echo This may take several minutes...
echo ========================================
echo.
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Your testing APK is located at:
    echo android/app/build/outputs/apk/release/app-release.apk
    echo.
    echo Opening APK folder...
    start "" "E:\Siddhant\Projects\ai-projects\Seeding\android\app\build\outputs\apk\release"
    echo.
    msg "%username%" "APK Build Complete! Your testing APK is ready at: android/app/build/outputs/apk/release/app-release.apk"
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    msg "%username%" "APK Build Failed! Please check the terminal for error details."
)

REM Return to root directory
cd ..

pause
