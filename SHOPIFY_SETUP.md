# 🚀 Shopify Store Connection Guide

## Overview
This guide will help you connect your Teletransport Product section to your Shopify store properly.

## Prerequisites
- Admin access to your Shopify store
- The `teletransport.liquid` file uploaded to your theme

## Step 1: Upload the Section File

1. **Access Theme Editor**
   - Go to your Shopify Admin → Online Store → Themes
   - Click "Actions" → "Edit code"

2. **Upload Section**
   - In the "Sections" folder, create a new file called `teletransport.liquid`
   - Copy all the content from your local `teletransport.liquid` file
   - Save the file

## Step 2: Add Section to Templates

### For Product Pages:
1. Go to "Templates" folder
2. Open `product.liquid` or create `product.teletransport.liquid`
3. Add this line where you want the section to appear:
```liquid
{% section 'teletransport' %}
```

### For Collection Pages (optional):
1. Open `collection.liquid`
2. Add the same section tag

## Step 3: Configure Section Settings

1. **Go to Theme Customizer**
   - Online Store → Themes → Customize

2. **Add the Section**
   - Navigate to a product page in the customizer
   - Add section → "Teletransport Product"

3. **Configure Store Connection**
   - Enable debug mode to see connection status
   - Set fallback product if needed
   - Configure navigation menu

## Step 4: Set Up Metafields (For Advanced Features)

Create these metafields in your Shopify Admin:

### Product Metafields:
```
Namespace: custom
Key: customization_enabled
Type: Boolean
```

```
Namespace: custom
Key: designs
Type: Multi-line text
```

```
Namespace: custom
Key: allowed_methods
Type: Multi-line text
```

### For Neon Customizer (Advanced):
Create metaobjects for fonts and glow effects:
- `custom_font_def`
- `glow_effect_def`

## Step 5: Test Connection

1. **Check Debug Console**
   - Open browser developer tools (F12)
   - Navigate to a product page with the section
   - Look for "🔗 Store Connection Debug" in console

2. **Verify Features**
   - Product switching works
   - Add to cart functions
   - Customization options appear for tagged products

## Troubleshooting

### Common Issues:

**Section not appearing:**
- Verify file is in `/sections/` folder
- Check file name is exactly `teletransport.liquid`
- Ensure section is added to template

**Products not loading:**
- Check product exists and is published
- Verify collection settings
- Enable debug mode to see data

**Customization not working:**
- Add 'customizable' tag to products
- Or configure product types in section settings

## Advanced Configuration

### Custom Product Tags:
Tag products with:
- `customizable` - Shows customize button
- `neon` - Enables neon customizer
- `vinyl-only` - Restricts to vinyl method

### Navigation Setup:
1. Create navigation menu in Admin → Navigation
2. Assign menu in section settings
3. Configure submenu structure

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all liquid syntax is correct
3. Test in preview mode first
4. Contact support with debug info

---

*This app integrates seamlessly with your existing Shopify theme while adding advanced product customization features.*