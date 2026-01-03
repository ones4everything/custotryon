#!/bin/bash

# ONES4 Fly.io Deployment Debug Script
echo "🔍 Debugging Fly.io deployment crash..."

echo ""
echo "📋 Step 1: Check current deployment logs"
echo "Run this command to see what's causing the crash:"
echo "fly logs -a ones4app"
echo ""

echo "📋 Step 2: Common crash causes and fixes:"
echo ""
echo "❌ Problem: Missing environment variables"
echo "✅ Solution: Set required env vars:"
echo "   fly secrets set PAYLOAD_SECRET=your-secret-key-here -a ones4app"
echo "   fly secrets set DATABASE_URI=your-mongodb-uri -a ones4app"
echo ""

echo "❌ Problem: Port binding issues"
echo "✅ Solution: Ensure server listens on 0.0.0.0:8080"
echo ""

echo "❌ Problem: Import/module errors"
echo "✅ Solution: Replace src/server.ts with server-minimal.ts"
echo ""

echo "📋 Step 3: Quick fixes to try:"
echo ""
echo "🔧 Option A: Use minimal server"
echo "   cp server-minimal.ts src/server.ts"
echo "   git add src/server.ts"
echo "   git commit -m 'Use minimal server for deployment'"
echo "   git push"
echo ""

echo "🔧 Option B: Set environment variables"
echo "   fly secrets set PAYLOAD_SECRET=\$(openssl rand -base64 32) -a ones4app"
echo "   fly secrets set DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/ones4 -a ones4app"
echo ""

echo "🔧 Option C: Check fly.toml configuration"
echo "   Make sure port is set to 8080 in fly.toml"
echo ""

echo "📋 Step 4: Test locally first"
echo "   npm install"
echo "   npm run dev"
echo "   # If it works locally, then deploy"
echo ""

echo "📋 Step 5: Deploy with verbose logging"
echo "   fly deploy --verbose -a ones4app"
echo ""

echo "🚀 Most likely fix: Replace your server.ts with this minimal version:"
echo ""
cat << 'EOF'
// COPY THIS TO src/server.ts
import express from 'express'
import payload from 'payload'

const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/', (req, res) => res.redirect('/admin'))

async function start() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'default-secret',
    express: app
  })
  
  app.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log('Server started on port', process.env.PORT || 8080)
  })
}

start().catch(console.error)
EOF

echo ""
echo "After copying this code:"
echo "1. Save the file"
echo "2. git add src/server.ts"
echo "3. git commit -m 'Fix server crash'"
echo "4. git push"
echo ""
echo "Your app should then deploy successfully! 🎉"