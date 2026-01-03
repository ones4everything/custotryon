# 🎨 Print Designer App Integration

## App Connection Status
- **App Location**: `C:\Users\Noe\customization\print-designer`
- **Store**: www.ones4.com (jfg9tu-fb.myshopify.com) 
- **Integration Status**: ✅ Ready to Connect

## 🔗 Connection Configuration

### Store Environment Detection
The teletransport section automatically detects your store:
```liquid
{% if store_domain == 'jfg9tu-fb.myshopify.com' %}
  {% assign is_production = true %}
{% endif %}
```

### Print Designer API Endpoints
Your app should connect to these Shopify endpoints:

**Product Data API:**
```
GET https://jfg9tu-fb.myshopify.com/admin/api/2023-10/products.json
GET https://jfg9tu-fb.myshopify.com/admin/api/2023-10/products/{product_id}.json
```

**Cart Integration:**
```
POST https://jfg9tu-fb.myshopify.com/cart/add.js
POST https://jfg9tu-fb.myshopify.com/cart/update.js
```

## 📝 Integration Points

### 1. Product Customization Detection
The teletransport section detects customizable products via:
- Product tags: `customizable`, `personalized`, `custom`
- Product type rules (configurable in section settings)
- Metafield override: `custom.customization_enabled`

### 2. Neon Customizer Integration
For neon products, the section enables advanced customization:
- Custom fonts from metaobjects: `shop.metaobjects.custom_font_def.values`
- Glow effects from: `shop.metaobjects.glow_effect_def.values` 
- Canvas rendering with real-time preview

### 3. Line Item Properties
When customers customize products, these properties are added:
- `properties[Method]` - Sublimation/Vinyl
- `properties[Custom Text]` - User input text
- `properties[Design]` - Selected design
- `properties[_Preview]` - Generated preview image (data URL)

## 🚀 App Integration Steps

### Step 1: Store Authentication
Your Print Designer app needs to authenticate with Shopify:

```javascript
// In your app's config
const storeConfig = {
  development: {
    domain: 'your-dev-store.myshopify.com',
    apiKey: 'your-dev-api-key',
    password: 'your-dev-password'
  },
  production: {
    domain: 'jfg9tu-fb.myshopify.com',
    apiKey: 'your-production-api-key', 
    password: 'your-production-password'
  }
};
```

### Step 2: Product Sync
Sync customizable products from your store:

```javascript
async function syncCustomizableProducts() {
  const products = await fetch(`${storeConfig.production.domain}/admin/api/2023-10/products.json?tags=customizable`);
  // Process products for your design interface
}
```

### Step 3: Design Output Integration
When users complete designs in your app, send to Shopify cart:

```javascript
async function addCustomizedProduct(productId, variantId, designData) {
  const cartData = {
    id: variantId,
    quantity: 1,
    properties: {
      'Method': designData.method,
      'Custom Text': designData.text,
      'Design': designData.designName,
      '_Preview': designData.previewDataUrl
    }
  };
  
  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cartData)
  });
}
```

## 🎯 App Features to Connect

### Canvas Design Engine
Your print designer's canvas should integrate with:
- Product image overlays
- Text customization tools  
- Design template library
- Real-time preview generation

### Export Integration
Generate outputs for:
- Shopify cart (web preview)
- Print production (high-res files)
- Customer proof images

### Store Sync Features  
- Product catalog sync
- Design template management
- Customer order processing
- Production file generation

## 🔧 Technical Requirements

### App Dependencies
Ensure your app supports:
- Shopify Admin API access
- Storefront API (optional)
- Canvas/WebGL for design rendering
- File upload/download capabilities

### Data Flow
1. **Customer** → Selects product on ONES4 store
2. **Store** → Detects customizable product, shows customize button
3. **Customer** → Clicks customize, opens your Print Designer app
4. **App** → Provides design tools and real-time preview
5. **Customer** → Completes design, adds to cart
6. **Store** → Receives customized product with design data
7. **Fulfillment** → Uses design data for production

## 🚀 Next Steps

1. **Set up API credentials** for your app to access ONES4 store
2. **Configure webhooks** for order processing
3. **Test integration** with development products
4. **Deploy to production** when ready

Would you like help with any specific integration step?