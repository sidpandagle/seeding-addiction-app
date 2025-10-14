@echo off
echo ========================================
echo Building Seeding Testing APK
echo ========================================
echo.
echo This will create an APK for testing only.
echo For Play Store builds, use build-production.bat
echo.

REM Change to the Android directory
cd android

echo [1/3] Cleaning previous build...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building Release APK...
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Copying APK to project root...
cd ..
if not exist "builds" mkdir builds
copy "android\app\build\outputs\apk\release\app-release.apk" "builds\Seeding-testing.apk"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy APK!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo SUCCESS! APK built successfully!
echo ========================================
echo.
echo APK Location: builds\Seeding-testing.apk
echo.
echo You can install this APK on your Android device for testing.
echo.
pause
