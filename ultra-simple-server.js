// SUPER SIMPLE SERVER - NO TYPESCRIPT, NO COMPLEX BUILDS
// Just copy this to your src/server.js and deploy

const express = require('express')
const app = express()

app.use(express.json())

// Health check for Fly.io
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Your ONES4 Print Designer routes
app.get('/', (req, res) => {
  res.send(`
    <h1>🎨 ONES4 Print Designer</h1>
    <p>✅ Server is running!</p>
    <p>🔗 Store: www.ones4.com</p>
    <p>⚡ Ready for integration</p>
    <a href="/admin">Go to Admin</a>
  `)
})

app.get('/admin', (req, res) => {
  res.send(`
    <h1>📊 ONES4 Admin</h1>
    <p>✅ Your app is working!</p>
    <p>Next: Add your Print Designer features</p>
  `)
})

// Print Designer API
app.post('/api/design', (req, res) => {
  console.log('🎨 Design request:', req.body)
  res.json({ 
    success: true, 
    message: 'Design received',
    store: 'www.ones4.com'
  })
})

// Start server
const PORT = parseInt(process.env.PORT || '8080')
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ONES4 Print Designer running on port ${PORT}`)
  console.log(`🌐 Visit: https://ones4app.fly.dev`)
})

console.log('🚀 ONES4 Print Designer starting...')