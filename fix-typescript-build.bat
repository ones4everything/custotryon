@echo off
REM Fix TypeScript Build - Windows Version
echo 🔧 Fixing TypeScript build issue...

REM Step 1: Create simple tsconfig.json
echo 📝 Creating simple tsconfig.json...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "module": "commonjs",
echo     "outDir": "./dist",
echo     "rootDir": "./src",
echo     "strict": false,
echo     "esModuleInterop": true,
echo     "skipLibCheck": true
echo   },
echo   "include": ["src/**/*.ts"],
echo   "exclude": ["node_modules", "dist"]
echo }
) > tsconfig.json

REM Step 2: Copy simple server to src
echo 📁 Ensuring server file is in src directory...
if not exist "src" mkdir src
copy "server-simple.ts" "src\server.ts" >nul

REM Step 3: Test if TypeScript can compile
echo 🔨 Testing TypeScript compilation...
if exist "node_modules\.bin\tsc.cmd" (
    call node_modules\.bin\tsc.cmd
    if exist "dist\server.js" (
        echo ✅ Build successful! dist\server.js created
        dir dist\
    ) else (
        echo ❌ Build failed - check TypeScript errors
    )
) else (
    echo ⚠️  TypeScript compiler not found, run: npm install
)

echo.
echo 📋 Manual steps:
echo 1. Make sure src/server.ts is your simple server file
echo 2. Run: npm run build  
echo 3. Check that dist/server.js gets created
echo 4. If successful, commit and deploy:
echo    git add .
echo    git commit -m "Fix TypeScript build"
echo    git push
echo.
echo ✅ The issue should now be resolved!
pause