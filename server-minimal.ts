import express from 'express'
import payload from 'payload'

// Super minimal server for Fly.io deployment
const app = express()

// Basic middleware
app.use(express.json({ limit: '10mb' }))

// Health check for Fly.io
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/admin')
})

async function start() {
  console.log('Starting server...')
  
  try {
    // Initialize Payload CMS
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key',
      express: app,
      onInit: () => {
        console.log('Payload initialized')
      }
    })

    // Start server
    const PORT = process.env.PORT || 8080
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (error) {
    console.error('Server start failed:', error)
    process.exit(1)
  }
}

start()