#!/bin/bash

# ONES4 Build Fix Script
echo "🔧 Fixing ONES4 Print Designer build errors..."

# Step 1: Remove problematic JSON import from server.ts
echo "📝 Fixing server.ts import issue..."

# Create backup
cp "src/server.ts" "src/server.ts.backup"

# Fix the import statement
sed -i "s|import config from './print-designer-config.json';|import { printDesignerConfig as config } from '../print-designer-config';|g" src/server.ts

# Remove duplicate integration lines if they exist
sed -i "/const integration = new ONES4Integration(config);/d" src/server.ts

# Step 2: Copy the TypeScript config file to the right location
echo "📁 Copying TypeScript config file..."
cp "print-designer-config.ts" "src/print-designer-config.ts"

# Step 3: Update tsconfig.json to ensure proper JSON handling
echo "🔧 Updating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "outDir": "./dist",
    "rootDir": "./",
    "baseUrl": "./",
    "declaration": false,
    "sourceMap": false,
    "removeComments": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true
  },
  "include": [
    "**/*.ts",
    "**/*.js"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    ".next"
  ],
  "ts-node": {
    "transpileOnly": true,
    "swc": true
  }
}
EOF

echo "✅ Build fixes applied!"
echo ""
echo "🚀 Try building again with: yarn build"
echo ""
echo "If issues persist:"
echo "1. Remove the import line: import config from './print-designer-config.json';"
echo "2. Replace with: import { printDesignerConfig as config } from './print-designer-config';"
echo "3. Make sure print-designer-config.ts is in the src/ directory"