# 🎨 ONES4 Print Designer CMS

A complete Payload CMS backend system that integrates your Print Designer app (`C:\Users\Noe\customization\print-designer`) with your ONES4 Shopify store (`www.ones4.com`).

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to project directory
cd e:\Ones4-Main\website

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### 2. Environment Setup

Edit `.env` file with your actual credentials:

```bash
# Database
DATABASE_URI=mongodb://localhost:27017/ones4-print-designer

# Payload CMS  
PAYLOAD_SECRET=your-super-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# ONES4 Shopify Store
SHOPIFY_STORE_DOMAIN=jfg9tu-fb.myshopify.com
SHOPIFY_PUBLIC_DOMAIN=www.ones4.com
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_PASSWORD=your-shopify-password

# Print Designer App
PRINT_DESIGNER_PATH=C:\Users\Noe\customization\print-designer
```

### 3. Start the System

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run serve
```

## 📊 What This System Provides

### **Admin Dashboard** 
- **URL**: `http://localhost:3000/admin`
- Manage custom designs, print jobs, templates
- Monitor ONES4 store orders
- Control Print Designer integration

### **API Endpoints**
- `/api/ones4/webhook` - Shopify webhook handler
- `/api/print-designer/design` - Save custom designs
- `/api/print-designer/products` - Get customizable products

### **Database Collections**

#### **Custom Designs**
- Product customizations from your Print Designer app
- Canvas data, text, colors, effects
- Preview images and production files
- Customer information

#### **Print Jobs** 
- Automatic jobs created from ONES4 orders
- Production queue management
- Status tracking (pending → approved → printing → shipped)
- Integration with your Print Designer output

#### **Templates**
- Reusable design templates
- Neon effect presets
- Font combinations
- Brand assets

#### **Products**
- Sync with ONES4 store catalog
- Customization capabilities per product
- Print method compatibility
- Pricing and variants

## 🔗 Integration Flow

```mermaid
graph TB
    A[Customer on ONES4.com] --> B[Product Page]
    B --> C[Clicks Customize Button]
    C --> D[Opens Print Designer App]
    D --> E[Creates Custom Design] 
    E --> F[Saves to Payload CMS]
    F --> G[Adds to Cart with Preview]
    G --> H[Customer Checks Out]
    H --> I[Webhook to Payload CMS]
    I --> J[Creates Print Job]
    J --> K[Production Queue]
```

## 🎨 Print Designer Integration

### **Automatic Detection**
The system automatically detects when customers want to customize products:

1. **ONES4 Store** shows "Customize" button for tagged products
2. **Teletransport Section** captures the customize request  
3. **Integration Layer** launches your Print Designer app
4. **Payload CMS** saves the completed design
5. **Store Integration** adds customized product to cart

### **Neon Customizer**
Special support for neon sign customization:

- **Custom Fonts**: Orbitron, Space Grotesk, Rajdhani
- **Glow Effects**: Electric Blue, Neon Green, Hot Pink, etc.
- **Real-time Preview**: Canvas rendering with live glow effects
- **Production Output**: High-res files for LED cutting

## 📁 File Structure

```
e:\Ones4-Main\website\
├── payload.config.ts          # Main Payload configuration
├── server.ts                  # Express server with ONES4 integration  
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment template
├── ones4-integration.js       # Store integration helper
├── print-designer-config.json # App configuration
├── src/
│   ├── collections/           # Data models
│   │   ├── Users.ts
│   │   ├── Products.ts  
│   │   ├── CustomDesigns.ts
│   │   ├── PrintJobs.ts
│   │   └── Templates.ts
│   ├── globals/               # Site-wide settings
│   │   ├── SiteSettings.ts
│   │   └── StoreIntegration.ts
│   └── styles/
│       └── admin.scss         # Custom admin styles
└── uploads/                   # File storage
```

## 🔧 Configuration Options

### **Print Designer Settings**
```typescript
printDesigner: {
  appPath: 'C:\\Users\\Noe\\customization\\print-designer',
  integrationEnabled: true,
  
  canvas: {
    maxWidth: 4200,
    maxHeight: 3150,
    dpi: 300,
  },
  
  methods: ['Sublimation', 'Vinyl', 'DTF', 'Screen Print'],
}
```

### **ONES4 Store Settings**
```typescript
store: {
  domain: 'jfg9tu-fb.myshopify.com',
  publicDomain: 'www.ones4.com', 
  apiVersion: '2023-10',
}
```

### **Neon Engine Settings**
```typescript
neonEngine: {
  enabled: true,
  fonts: [...],
  glowEffects: [...],
}
```

## 📦 Production Deployment

### **Database Setup**
```bash
# MongoDB (recommended)
DATABASE_URI=mongodb+srv://user:password@cluster.mongodb.net/ones4-print-designer

# Or local MongoDB
DATABASE_URI=mongodb://localhost:27017/ones4-print-designer
```

### **File Storage Options**

**Local Storage** (development):
```bash
UPLOAD_DIR=./uploads
```

**AWS S3** (production):
```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_BUCKET=ones4-print-designs
```

### **Security**
```bash
# Strong secret key
PAYLOAD_SECRET=your-super-long-random-secret-key

# CORS origins
CORS_ORIGINS=https://www.ones4.com,https://jfg9tu-fb.myshopify.com
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Generate TypeScript types
npm run generate:types

# Generate GraphQL schema
npm run generate:graphql-schema

# Run Payload CLI
npm run payload
```

## 📞 Support & Troubleshooting

### **Common Issues**

**Print Designer App Not Launching:**
- Check `PRINT_DESIGNER_PATH` in `.env`
- Verify app exists at `C:\Users\Noe\customization\print-designer`
- Check browser console for integration errors

**ONES4 Store Connection Failed:**
- Verify `SHOPIFY_API_KEY` and `SHOPIFY_PASSWORD`
- Check store domain: `jfg9tu-fb.myshopify.com`
- Ensure API permissions are configured

**Database Connection Issues:**
- Verify MongoDB is running
- Check `DATABASE_URI` format
- Ensure network connectivity

### **Debug Mode**
Enable debug logging:
```bash
NODE_ENV=development
DEBUG=payload:*
```

### **Webhook Testing**
Test ONES4 webhooks:
```bash
# Use ngrok for local development
npx ngrok http 3000

# Update Shopify webhook URL to:
# https://your-ngrok-url.ngrok.io/api/ones4/webhook
```

## 🔄 Backup & Recovery

### **Database Backup**
```bash
# MongoDB dump
mongodump --uri="your-connection-string" --out=./backup

# Restore
mongorestore --uri="your-connection-string" ./backup
```

### **File Backup**
```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz ./uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

---

🎉 **Your ONES4 Print Designer CMS is now ready!** 

Visit `http://localhost:3000/admin` to start managing your print customization workflow.