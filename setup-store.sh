#!/bin/bash

# 🏪 Shopify Store Configuration Helper
# This script helps you set up your official store connection

echo "🚀 Shopify Store Setup Helper"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Current Setup Status:${NC}"

# Check for Shopify CLI
if command -v shopify &> /dev/null; then
    echo -e "✅ Shopify CLI: ${GREEN}Installed${NC}"
else
    echo -e "❌ Shopify CLI: ${RED}Not found${NC}"
    echo "   Install with: npm install -g @shopify/cli @shopify/theme"
fi

# Check for theme files
if [ -f "teletransport.liquid" ]; then
    echo -e "✅ Section file: ${GREEN}Found${NC}"
else
    echo -e "❌ Section file: ${RED}Missing teletransport.liquid${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Configuration Steps:${NC}"
echo ""

# Step 1: Store domain setup
echo -e "${BLUE}Step 1: Configure Store Domain${NC}"
echo "Edit your teletransport.liquid file and replace:"
echo "  'your-official-store.myshopify.com'"
echo "with your actual store domain."
echo ""

# Step 2: Upload section
echo -e "${BLUE}Step 2: Deploy to Official Store${NC}"
echo "Run one of these commands:"
echo ""
echo -e "${GREEN}Option A - Shopify CLI:${NC}"
echo "  shopify theme push --store=YOUR-STORE.myshopify.com"
echo ""
echo -e "${GREEN}Option B - Manual Upload:${NC}"
echo "  1. Go to Online Store → Themes → Edit Code"
echo "  2. Upload teletransport.liquid to /sections/ folder"
echo ""

# Step 3: Configure products
echo -e "${BLUE}Step 3: Tag Your Products${NC}"
echo "Add these tags to products you want to enable customization:"
echo "  • 'customizable' - Basic customization features"
echo "  • 'neon' - Advanced neon text customizer"
echo "  • 'vinyl-only' - Restrict to vinyl printing"
echo ""

# Step 4: Test
echo -e "${BLUE}Step 4: Test Connection${NC}"
echo "1. Add the section to a product page template"
echo "2. Enable debug mode in section settings"
echo "3. Check browser console for connection info"
echo ""

echo -e "${YELLOW}🔍 Need help? Check the debug output:${NC}"
echo "Look for '🔗 Store Connection Debug' in browser console"
echo ""

echo -e "${GREEN}Ready to deploy to ONES4 (www.ones4.com)? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Great! Your ONES4 store is configured as:"
    echo "  Internal: jfg9tu-fb.myshopify.com"
    echo "  Public: www.ones4.com"
    echo ""
    echo "Next steps:"
    echo "1. Upload teletransport.liquid to your theme"
    echo "2. Add section to product templates"
    echo "3. Configure section settings"
    echo "4. Test with debug mode enabled"
    echo ""
    echo -e "${GREEN}✅ Ready for deployment!${NC}"
else
    echo "No problem! Run this script again when you're ready."
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Store Setup Guide: STORE_SETUP.md"
echo "• Full Setup Guide: SHOPIFY_SETUP.md"
echo "• Configuration: store-config.json"