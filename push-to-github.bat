@echo off
chcp 65001 >nul
echo ========================================================
echo   رفع مشروع براند فضة (ORMA) على GitHub
echo   المستودع: https://github.com/karim-mostafa6/athar-silver-store
echo ========================================================
echo.

set "PATH=%PATH%;%USERPROFILE%\MinGit\cmd;%USERPROFILE%\gh\bin"

git remote remove origin 2>nul
git remote add origin https://github.com/karim-mostafa6/athar-silver-store.git
git branch -M main

echo [1/3] فحص تسجيل الدخول في GitHub...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo يلزم تسجيل الدخول لمرة واحدة في GitHub لتأكيد ملكية الحساب:
    echo سيفتح المتصفح تلقائياً لتسجيل الدخول والضغط على (Authorize)...
    echo.
    gh auth login --web -p https
    gh auth setup-git
)

echo.
echo [2/3] جاري رفع كافة ملفات المشروع إلى GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   مبروك! تم رفع كود المتجر بالكامل بنجاح إلى GitHub!
    echo   رابط المستودع:
    echo   https://github.com/karim-mostafa6/athar-silver-store
    echo ========================================================
) else (
    echo.
    echo حدث خطأ أثناء الرفع، تأكد من تسجيل الدخول في GitHub.
)

echo.
pause
