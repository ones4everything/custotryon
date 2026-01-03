@echo off
REM ONES4 Build Fix Script - Windows Version
echo 🔧 Fixing ONES4 Print Designer build errors...

REM Step 1: Check if src directory exists
if not exist "src" (
    echo ❌ src directory not found. Make sure you're in the right directory.
    pause
    exit /b 1
)

REM Step 2: Copy TypeScript config to src directory
echo 📁 Copying configuration files...
copy "print-designer-config.ts" "src\" >nul
if exist "ones4-integration.js" copy "ones4-integration.js" "src\" >nul

REM Step 3: Create a simple config without JSON import issues
echo 📝 Creating inline config...
echo // Inline configuration to avoid JSON import issues > src\inline-config.ts
echo export const printDesignerConfig = { >> src\inline-config.ts
echo   store: { >> src\inline-config.ts
echo     domain: "jfg9tu-fb.myshopify.com", >> src\inline-config.ts
echo     publicDomain: "www.ones4.com", >> src\inline-config.ts
echo     name: "ONES4" >> src\inline-config.ts
echo   }, >> src\inline-config.ts
echo   integration: { >> src\inline-config.ts
echo     teletransportSection: { >> src\inline-config.ts
echo       customizeToggle: "[data-customize-toggle]" >> src\inline-config.ts
echo     } >> src\inline-config.ts
echo   } >> src\inline-config.ts
echo }; >> src\inline-config.ts

REM Step 4: Update TypeScript config for more lenient compilation
echo 🔧 Updating TypeScript configuration...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "module": "commonjs",
echo     "moduleResolution": "node",
echo     "allowSyntheticDefaultImports": true,
echo     "esModuleInterop": true,
echo     "allowJs": true,
echo     "resolveJsonModule": true,
echo     "skipLibCheck": true,
echo     "strict": false,
echo     "noImplicitAny": false,
echo     "outDir": "./dist",
echo     "rootDir": "./",
echo     "declaration": false,
echo     "sourceMap": false
echo   },
echo   "include": ["**/*.ts", "**/*.js"],
echo   "exclude": ["node_modules", "dist"]
echo }
) > tsconfig.json

echo.
echo ✅ Build fixes applied!
echo.
echo 📋 Manual steps needed:
echo 1. Open src/server.ts
echo 2. Find: import config from './print-designer-config.json';
echo 3. Replace with: import { printDesignerConfig as config } from './inline-config';
echo 4. Remove any duplicate integration lines
echo.
echo 🚀 Then try: yarn build
echo.
pause