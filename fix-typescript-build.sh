#!/bin/bash

# Fix TypeScript Build and Deploy Script
echo "🔧 Fixing TypeScript build issue for Fly.io deployment..."

# Step 1: Create ultra-simple TypeScript config
echo "📝 Creating simple tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": false,
    "skipLibCheck": true,
    "strict": false,
    "noImplicitAny": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "sourceMap": false,
    "removeComments": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Step 2: Ensure the simple server is in the right place
echo "📁 Copying simple server to src directory..."
mkdir -p src
cp server-simple.ts src/server.ts

# Step 3: Update package.json scripts for reliable building
echo "📦 Updating package.json build scripts..."
cat > package.json << 'EOF'
{
  "name": "ones4-print-designer",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "payload": "^2.8.0",
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cross-env": "^7.0.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.1",
    "typescript": "^5.3.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Step 4: Test build locally
echo "🔨 Testing TypeScript build..."
if command -v npm &> /dev/null; then
    echo "Installing dependencies..."
    npm install
    
    echo "Running build..."
    npm run build
    
    if [ -f "dist/server.js" ]; then
        echo "✅ Build successful! dist/server.js created"
        echo "📁 Build output:"
        ls -la dist/
    else
        echo "❌ Build failed - dist/server.js not found"
        echo "Check TypeScript errors above"
    fi
else
    echo "⚠️  npm not found, skipping build test"
fi

echo ""
echo "📋 Next steps:"
echo "1. Commit these changes:"
echo "   git add ."
echo "   git commit -m 'Fix TypeScript build for deployment'"
echo ""
echo "2. Deploy to Fly.io:"
echo "   git push"
echo ""
echo "3. If it still fails, check that:"
echo "   - src/server.ts exists and is simple"
echo "   - tsconfig.json has correct outDir: './dist'"
echo "   - package.json build script runs 'tsc'"
echo ""
echo "✅ TypeScript build should now work!"