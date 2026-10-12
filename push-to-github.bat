@echo off
chcp 65001 >nul
echo ========================================================
echo  رفع مشروع براند فضة (ATHAR) على GitHub
echo ========================================================
echo.
set /p REPO_URL="انسخ رابط المستودع من GitHub (مثال: https://github.com/username/athar-silver-store.git): "

if "%REPO_URL%"=="" (
    echo لم يتم إدخال رابط! يرجى إعادة المحاولة.
    pause
    exit /b
)

echo.
echo جاري ربط المستودع ورفع الملفات...
set "PATH=%PATH%;%USERPROFILE%\MinGit\cmd"
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================================
echo تم الانتهاء بنجاح! تفقد صفحة المستودع على GitHub.
echo ========================================================
pause
