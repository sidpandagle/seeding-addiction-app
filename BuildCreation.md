Build Creation (Used bash for below commands)

Step 1:
npx expo prebuild

Step 2:
cd E:\Siddhant\Projects\ai-projects\Seeding\android

Step 3:
Build APK:              ./gradlew.bat assembleRelease
OR
Build Production AAB:   ./gradlew.bat bundleRelease


Step4:
Check apk in android/app/build/outputs/apk/release/
OR
Check aab in android/app/build/outputs/bundle/release/
