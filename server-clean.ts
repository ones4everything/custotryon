import express from 'express'
import payload from 'payload'

require('dotenv').config()

// Simple configuration
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

const app = express()

// Basic middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

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

// Start function
async function start() {
  console.log('🚀 Starting ONES4 Print Designer server...')
  
  try {
    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'ones4-default-secret-key',
      express: app,
      onInit: () => {
        console.log('✅ Payload CMS initialized')
        console.log(`🔗 Store: ${config.store.publicDomain}`)
      }
    })

    // Simple API routes
    app.post('/api/webhook', (req, res) => {
      console.log('📬 Webhook received:', req.body?.topic || 'unknown')
      res.json({ success: true, timestamp: new Date().toISOString() })
    })
    
    app.get('/api/config', (req, res) => {
      res.json({
        ...config,
        status: 'active',
        timestamp: new Date().toISOString()
      })
    })

    // Start server - fix the PORT type issue
    const PORT = parseInt(process.env.PORT || '8080', 10)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📊 Admin: https://ones4app.fly.dev/admin`)
      console.log(`🎨 App: ${config.app.name} v${config.app.version}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down gracefully...')
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('❌ Server failed to start:', error)
    process.exit(1)
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason)
  process.exit(1)
})

// Start the server
start()