import express from 'express'
import payload from 'payload'
    // Start server
    const PORT = parseInt(process.env.PORT || '8080', 10)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📊 Admin: https://ones4app.fly.dev/admin`)
    })re('dotenv').config()

// Simplified config - no complex types that might break compilation
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

// Health check - required for Fly.io
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

// Start function with better error handling
async function start() {
  console.log('🚀 Starting server...')
  
  try {
    // Initialize Payload with minimal config
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'ones4-default-secret-key',
      express: app,
      onInit: () => {
        console.log('✅ Payload initialized')
        console.log(`🔗 Store: ${config.store.publicDomain}`)
      }
    })

    // Simple API routes
    app.post('/api/webhook', (req, res) => {
      console.log('📬 Webhook received')
      res.json({ success: true })
    })
    
    app.get('/api/config', (req, res) => {
      res.json(config)
    })

    // Start server
    const PORT = process.env.PORT || 8080
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`� Admin: https://ones4app.fly.dev/admin`)
    })

    // Handle shutdown
    process.on('SIGTERM', () => {
      console.log('� Shutting down...')
      server.close(() => process.exit(0))
    })

  } catch (error) {
    console.error('❌ Server failed:', error)
    process.exit(1)
  }
}

// Start the server
start()