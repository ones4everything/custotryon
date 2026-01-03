import { buildConfig } from 'payload/config'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'

// Collections
import { Users } from './src/collections/Users'
import { Products } from './src/collections/Products'
import { CustomDesigns } from './src/collections/CustomDesigns'
import { PrintJobs } from './src/collections/PrintJobs'
import { Templates } from './src/collections/Templates'

// Globals
import { SiteSettings } from './src/globals/SiteSettings'
import { StoreIntegration } from './src/globals/StoreIntegration'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- ONES4 Print Designer',
      favicon: '/assets/favicon.ico',
      ogImage: '/assets/og-image.jpg',
    },
    css: path.resolve(__dirname, 'src/styles/admin.scss'),
  },
  
  collections: [
    Users,
    Products,
    CustomDesigns,
    PrintJobs,
    Templates,
  ],
  
  globals: [
    SiteSettings,
    StoreIntegration,
  ],
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/ones4-print-designer',
  }),
  
  editor: slateEditor({}),
  
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  
  // ONES4 Store Integration
  custom: {
    store: {
      domain: 'jfg9tu-fb.myshopify.com',
      publicDomain: 'www.ones4.com',
      apiVersion: '2023-10',
    },
    
    printDesigner: {
      appPath: 'C:\\Users\\Noe\\customization\\print-designer',
      integrationEnabled: true,
      
      // Canvas settings
      canvas: {
        maxWidth: 4200,
        maxHeight: 3150,
        dpi: 300,
      },
      
      // Supported formats
      outputFormats: [
        { name: 'PNG', extension: '.png', mimeType: 'image/png' },
        { name: 'PDF', extension: '.pdf', mimeType: 'application/pdf' },
        { name: 'SVG', extension: '.svg', mimeType: 'image/svg+xml' },
      ],
      
      // Customization methods
      methods: ['Sublimation', 'Vinyl', 'DTF', 'Screen Print'],
    },
    
    // Neon customizer settings
    neonEngine: {
      enabled: true,
      fonts: [
        { name: 'Orbitron', family: 'Orbitron', weight: '400,700,900' },
        { name: 'Space Grotesk', family: 'Space Grotesk', weight: '300,500,700' },
        { name: 'Rajdhani', family: 'Rajdhani', weight: '400,600,700' },
      ],
      
      glowEffects: [
        { name: 'Electric Blue', primary: '#00aeff', secondary: 'rgba(0, 174, 255, 0.5)' },
        { name: 'Neon Green', primary: '#00ff8a', secondary: 'rgba(0, 255, 138, 0.5)' },
        { name: 'Hot Pink', primary: '#ff00c8', secondary: 'rgba(255, 0, 200, 0.5)' },
        { name: 'Cyber Yellow', primary: '#ffc400', secondary: 'rgba(255, 196, 0, 0.5)' },
        { name: 'Purple Haze', primary: '#b07dff', secondary: 'rgba(176, 125, 255, 0.5)' },
      ],
    },
  },
  
  // File upload configuration
  upload: {
    limits: {
      fileSize: 50000000, // 50MB
    },
  },
  
  // CORS configuration for ONES4 store
  cors: [
    'https://www.ones4.com',
    'https://jfg9tu-fb.myshopify.com',
    'http://localhost:3000',
    'http://localhost:8080',
  ],
  
  // Plugins
  plugins: [
    // Add any Payload plugins here
  ],
  
  // Express middleware
  express: {
    middleware: [
      // Custom middleware for ONES4 integration
      (req, res, next) => {
        // Add ONES4-specific headers
        res.setHeader('X-ONES4-Integration', 'enabled')
        next()
      },
    ],
  },
  
  // Hooks for ONES4 integration
  hooks: {
    beforeChange: [
      ({ collection, data, req }) => {
        // Add timestamps
        if (collection?.slug === 'custom-designs') {
          data.lastModified = new Date()
        }
        return data
      },
    ],
    
    afterChange: [
      async ({ collection, doc, req }) => {
        // Sync with ONES4 store when designs are created/updated
        if (collection?.slug === 'custom-designs' && doc.syncToStore) {
          try {
            await syncDesignToONES4Store(doc)
          } catch (error) {
            console.error('Failed to sync design to ONES4:', error)
          }
        }
      },
    ],
  },
  
  // Localization (if needed)
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  
  // Rate limiting
  rateLimit: {
    max: 2000,
    window: 900000, // 15 minutes
    skip: (req) => {
      // Skip rate limiting for ONES4 store requests
      return req.headers['x-ones4-store'] === 'true'
    },
  },
})

/**
 * Sync design to ONES4 store
 */
async function syncDesignToONES4Store(design: any) {
  const storeConfig = {
    domain: 'jfg9tu-fb.myshopify.com',
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_PASSWORD,
  }
  
  // Implementation would go here
  console.log('Syncing design to ONES4:', design.id)
}