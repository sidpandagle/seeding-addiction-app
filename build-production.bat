@echo off
echo ========================================
echo Building Seeding Production Builds
echo ========================================
echo.
echo This script will create:
echo 1. Testing APK (for direct installation)
echo 2. Production AAB (for Google Play Store)
echo.
pause

REM Change to the Android directory
cd android

echo.
echo ========================================
echo [1/4] Cleaning previous builds...
echo ========================================
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo [2/4] Building Testing APK...
echo ========================================
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: APK build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo [3/4] Building Production AAB...
echo ========================================
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ERROR: AAB build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo [4/4] Organizing build outputs...
echo ========================================
cd ..

REM Create builds directory if it doesn't exist
if not exist "builds" mkdir builds

REM Copy APK
echo Copying APK...
copy "android\app\build\outputs\apk\release\app-release.apk" "builds\Seeding-testing.apk"
if %errorlevel% neq 0 (
    echo WARNING: Failed to copy APK!
)

REM Copy AAB
echo Copying AAB...
copy "android\app\build\outputs\bundle\release\app-release.aab" "builds\Seeding-production.aab"
if %errorlevel% neq 0 (
    echo WARNING: Failed to copy AAB!
)

echo.
echo ========================================
echo SUCCESS! All builds completed!
echo ========================================
echo.
echo Build outputs saved to: builds\
echo.
echo Files created:
echo   - Seeding-testing.apk    (for direct installation and testing)
echo   - Seeding-production.aab (for Google Play Store upload)
echo.
echo APK Size:
dir "builds\Seeding-testing.apk" | findstr "Seeding-testing.apk"
echo.
echo AAB Size:
dir "builds\Seeding-production.aab" | findstr "Seeding-production.aab"
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo For Testing APK:
echo   - Transfer Seeding-testing.apk to your Android device
echo   - Enable "Install from Unknown Sources" if needed
echo   - Install and test the app
echo.
echo For Play Store AAB:
echo   - Sign in to Google Play Console
echo   - Go to your app's Release section
echo   - Upload builds\Seeding-production.aab
echo   - Complete the release process
echo.
echo NOTE: For Play Store, you may need to sign the AAB
echo with your upload key. Refer to Android signing docs.
echo.
pause
