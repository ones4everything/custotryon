# 🏪 Store Configuration

## Development Store
- **Store URL**: `your-dev-store.myshopify.com`
- **Purpose**: Testing and development
- **Status**: ✅ Connected

## Production Store (ONES4)
- **Internal Domain**: `jfg9tu-fb.myshopify.com`
- **Public Domain**: `www.ones4.com` 
- **Purpose**: Live customer sales
- **Status**: ✅ Configured - Ready to Deploy

## Connection Steps for Official Store

### 1. Theme Access
You'll need to add the Teletransport section to your official store's theme:

```bash
# Option A: Shopify CLI (Recommended)
shopify theme push --store=your-official-store.myshopify.com

# Option B: Manual upload via Admin
# Go to Online Store → Themes → Actions → Edit code
# Upload teletransport.liquid to /sections/ folder
```

### 2. Store Settings Configuration
Once uploaded, configure these settings in your theme customizer:

**🔗 Store Connection**
- [x] Enable debug mode (for testing)
- [ ] Fallback product: Select a default product
- [x] Shop menu: Set your main navigation

**🎨 Customization Settings**  
- [x] Enable customization toggle
- [ ] Custom product types: Add your product categories
- [ ] Design options: Configure available designs

### 3. Product Setup Checklist

For products you want to enable customization on:

**Tags to Add:**
- `customizable` - Basic customization features
- `neon` - Advanced neon text customizer
- `vinyl-only` - Restrict to vinyl printing only

**Metafields to Configure:**
```json
{
  "namespace": "custom",
  "key": "customization_enabled", 
  "type": "boolean",
  "value": true
}
```

### 4. Environment Variables

Create environment-specific settings:

**Development:**
```liquid
{% assign is_dev_store = shop.permanent_domain contains 'dev' %}
{% if is_dev_store %}
  {% assign debug_enabled = true %}
{% endif %}
```

**Production:**
```liquid
{% assign is_production = shop.permanent_domain == 'your-official-store.myshopify.com' %}
{% if is_production %}
  {% assign debug_enabled = false %}
  {% assign analytics_enabled = true %}
{% endif %}
```

### 5. Testing Checklist

Before going live, test these features:

- [ ] Product variant switching works
- [ ] Add to cart functionality 
- [ ] Customization options appear
- [ ] Neon customizer (if enabled)
- [ ] Mobile responsiveness
- [ ] Cart integration
- [ ] Checkout process

### 6. Go-Live Steps

1. **Backup Current Theme**: Always backup before deploying
2. **Deploy Section**: Upload teletransport.liquid 
3. **Configure Settings**: Set up section in theme customizer
4. **Tag Products**: Add customization tags to relevant products
5. **Test Order Flow**: Place a test order to verify everything works
6. **Monitor Console**: Check for any JavaScript errors

---

## Store Comparison

| Feature | Dev Store | Official Store |
|---------|-----------|----------------|
| Theme Integration | ✅ Active | ⏳ Pending |
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Customization | ✅ Testing | ⏳ Setup needed |
| Products Tagged | ✅ Dev products | ⏳ Production products |
| Analytics | ❌ Disabled | ✅ Will enable |

## Next Steps

1. **Share Store Details**: What's your official store domain?
2. **Access Level**: Do you have admin access or need help?
3. **Timeline**: When do you want to go live?
4. **Product Count**: How many products need customization setup?

Would you like help with any of these steps? 🚀