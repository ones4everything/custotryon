// Emergency JavaScript Server - No TypeScript Compilation Required
// This file bypasses all TypeScript build issues

const express = require('express')
const app = express()

// Basic middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ONES4 configuration
const config = {
  store: {
    domain: "jfg9tu-fb.myshopify.com", 
    publicDomain: "www.ones4.com",
    name: "ONES4"
  },
  app: {
    name: "ONES4 Print Designer",
    version: "1.0.0"
  }
}

// Health check for Fly.io
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    app: config.app.name,
    timestamp: new Date().toISOString()
  })
})

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/admin')
})

// API routes
app.post('/api/webhook', (req, res) => {
  console.log('📬 Webhook received:', req.body?.topic || 'unknown')
  res.json({ 
    success: true, 
    timestamp: new Date().toISOString(),
    store: config.store.name
  })
})

app.get('/api/config', (req, res) => {
  res.json({
    ...config,
    status: 'active',
    timestamp: new Date().toISOString()
  })
})

// Start function
async function start() {
  console.log('🚀 Starting ONES4 Print Designer (Emergency Mode)...')
  
  try {
    // Try to initialize Payload CMS
    const payload = require('payload')
    
    console.log('📦 Initializing Payload CMS...')
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'ones4-emergency-secret',
      express: app,
      onInit: () => {
        console.log('✅ Payload CMS initialized successfully')
        console.log(`🔗 Store: ${config.store.publicDomain}`)
      }
    })

    console.log('✅ Full CMS mode activated')

  } catch (error) {
    console.warn('⚠️ Payload CMS failed to initialize:', error.message)
    console.log('🔄 Running in basic mode without CMS...')
    
    // Add basic admin route if Payload fails
    app.get('/admin', (req, res) => {
      res.send(`
        <h1>ONES4 Print Designer</h1>
        <p>Emergency mode - CMS initialization failed</p>
        <p>Store: ${config.store.publicDomain}</p>
        <p>Status: Basic server running</p>
      `)
    })
  }

  // Start the server
  const PORT = parseInt(process.env.PORT || '8080', 10)
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Emergency server running on port ${PORT}`)
    console.log(`📊 Admin: https://ones4app.fly.dev/admin`)
    console.log(`🔗 Store: ${config.store.publicDomain}`)
    console.log(`🎨 App: ${config.app.name} v${config.app.version}`)
    console.log(`⚡ Server listening on 0.0.0.0:${PORT}`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...')
    server.close(() => {
      console.log('✅ Server closed successfully')
      process.exit(0)
    })
  })

  // Error handling
  server.on('error', (error) => {
    console.error('❌ Server error:', error)
    process.exit(1)
  })
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  console.log('🔄 Attempting to continue...')
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason)
  console.log('🔄 Attempting to continue...')
})

// Start the emergency server
console.log('🚨 ONES4 Emergency Server Starting...')
start().catch((error) => {
  console.error('❌ Emergency server failed to start:', error)
  
  // Last resort: basic Express server
  console.log('🆘 Starting last resort basic server...')
  const PORT = parseInt(process.env.PORT || '8080', 10)
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🆘 Last resort server running on port ${PORT}`)
    console.log('Basic HTTP server active - no CMS features')
  })
})