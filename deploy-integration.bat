@echo off
REM ONES4 Print Designer Integration - Windows Deployment
echo 🚀 Deploying ONES4 Print Designer Integration...

REM Create backup directory
set BACKUP_DIR=C:\Users\Noe\customization\print-designer\backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul

REM Backup existing files
echo 📦 Creating backup...
if exist "C:\Users\Noe\customization\print-designer\src\services\canvas.js" (
    copy "C:\Users\Noe\customization\print-designer\src\services\canvas.js" "%BACKUP_DIR%\"
)

REM Copy integration files
echo 📁 Copying integration files...
copy "e:\Ones4-Main\website\ones4-integration.js" "C:\Users\Noe\customization\print-designer\"
copy "e:\Ones4-Main\website\print-designer-config.json" "C:\Users\Noe\customization\print-designer\"
copy "e:\Ones4-Main\website\canvas-safety-wrapper.js" "C:\Users\Noe\customization\print-designer\"
copy "e:\Ones4-Main\website\canvas-fix-patch.js" "C:\Users\Noe\customization\print-designer\"

REM Create integration directory
mkdir "C:\Users\Noe\customization\print-designer\integration" 2>nul
copy "e:\Ones4-Main\website\print-designer-integration.md" "C:\Users\Noe\customization\print-designer\integration\"
copy "e:\Ones4-Main\website\print-designer-demo.html" "C:\Users\Noe\customization\print-designer\integration\"

echo.
echo ✅ Integration files deployed!
echo.
echo 📋 Next Steps:
echo 1. Open your main app file (index.html, main.js, or app.js)
echo 2. Add the integration import at the top
echo 3. Apply canvas safety fixes
echo 4. Test the ONES4 store connection
echo.
echo 🔧 Backup created at: %BACKUP_DIR%
echo.
pause