import express from 'express'
import payload from 'payload'
import { resolve } from 'path'

require('dotenv').config()

const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  // Add your own express routes here
  
  // ONES4 Store Integration Routes
  app.post('/api/ones4/webhook', async (req, res) => {
    try {
      // Handle Shopify webhooks
      const { topic, data } = req.body
      
      console.log('📬 Received ONES4 webhook:', topic)
      
      switch (topic) {
        case 'orders/create':
          await handleNewOrder(data)
          break
        case 'orders/updated':
          await handleOrderUpdate(data)
          break
        default:
          console.log('Unhandled webhook topic:', topic)
      }
      
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Webhook error:', error)
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  })
  
  // Print Designer Integration Routes
  app.post('/api/print-designer/design', async (req, res) => {
    try {
      const { productId, designData, customization } = req.body
      
      // Save design to Payload
      const design = await payload.create({
        collection: 'custom-designs',
        data: {
          productId,
          designData,
          customization,
          status: 'draft',
          createdBy: req.user?.id,
        }
      })
      
      res.json({ success: true, design })
    } catch (error) {
      console.error('Design save error:', error)
      res.status(500).json({ error: 'Failed to save design' })
    }
  })
  
  app.get('/api/print-designer/products', async (req, res) => {
    try {
      // Get customizable products from ONES4 store
      const products = await getCustomizableProducts()
      res.json(products)
    } catch (error) {
      console.error('Products fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch products' })
    }
  })

  const server = app.listen(process.env.PORT || 3000)

  console.log('🚀 ONES4 Print Designer CMS started!')
  console.log(`📊 Admin: http://localhost:${process.env.PORT || 3000}/admin`)
  console.log(`🔗 Store: ${process.env.SHOPIFY_PUBLIC_DOMAIN}`)
  console.log(`🎨 Designer: ${process.env.PRINT_DESIGNER_PATH}`)
}

/**
 * Handle new order from ONES4 store
 */
async function handleNewOrder(orderData: any) {
  console.log('📦 Processing new order:', orderData.id)
  
  // Check if order contains customized products
  const customItems = orderData.line_items?.filter((item: any) => 
    item.properties?.some((prop: any) => prop.name === 'Custom Text' || prop.name === '_Preview')
  )
  
  if (customItems?.length > 0) {
    // Create print jobs for custom items
    for (const item of customItems) {
      await payload.create({
        collection: 'print-jobs',
        data: {
          orderId: orderData.id,
          lineItemId: item.id,
          productTitle: item.title,
          customization: item.properties,
          status: 'pending',
          priority: 'normal',
        }
      })
    }
    
    console.log(`✅ Created ${customItems.length} print jobs for order ${orderData.id}`)
  }
}

/**
 * Handle order updates from ONES4 store  
 */
async function handleOrderUpdate(orderData: any) {
  console.log('📝 Processing order update:', orderData.id)
  
  // Update existing print jobs if needed
  const printJobs = await payload.find({
    collection: 'print-jobs',
    where: {
      orderId: {
        equals: orderData.id
      }
    }
  })
  
  // Update job status based on order status
  const newStatus = orderData.financial_status === 'paid' ? 'approved' : 'pending'
  
  for (const job of printJobs.docs) {
    await payload.update({
      collection: 'print-jobs',
      id: job.id,
      data: { status: newStatus }
    })
  }
}

/**
 * Get customizable products from ONES4 store
 */
async function getCustomizableProducts() {
  // This would fetch from Shopify API
  // For now, return mock data
  return [
    {
      id: '123456789',
      title: 'H-Town Tank Top',
      type: 'T-Shirts',
      tags: ['customizable', 'houston', 'tank'],
      vendor: 'ONES4'
    }
  ]
}

start()