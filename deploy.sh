#!/bin/bash

# Shopify Theme Installation Script
# This script helps deploy your Teletransport section to Shopify

echo "🚀 Shopify Theme Deployment Script"
echo "=================================="

# Check if Shopify CLI is installed
if ! command -v shopify &> /dev/null; then
    echo "❌ Shopify CLI not found. Please install it first:"
    echo "   npm install -g @shopify/cli @shopify/theme"
    exit 1
fi

echo "✅ Shopify CLI found"

# Check if we're in a theme directory
if [ ! -f "config/settings_schema.json" ]; then
    echo "❌ Not in a Shopify theme directory"
    echo "   Please run this script from your theme root folder"
    exit 1
fi

echo "✅ Theme directory detected"

# Copy section file
if [ -f "../teletransport.liquid" ]; then
    cp "../teletransport.liquid" "sections/teletransport.liquid"
    echo "✅ Section file copied to sections/"
else
    echo "❌ teletransport.liquid not found in parent directory"
    exit 1
fi

# Create backup of product template
if [ -f "templates/product.liquid" ]; then
    cp "templates/product.liquid" "templates/product.backup.liquid"
    echo "✅ Product template backed up"
fi

# Add section to product template
if ! grep -q "teletransport" "templates/product.liquid" 2>/dev/null; then
    echo "" >> "templates/product.liquid"
    echo "{% comment %} Teletransport Product Section {% endcomment %}" >> "templates/product.liquid"
    echo "{% section 'teletransport' %}" >> "templates/product.liquid"
    echo "✅ Section added to product template"
else
    echo "ℹ️  Section already exists in product template"
fi

# Deploy to Shopify
echo ""
echo "🚀 Deploying to Shopify..."
shopify theme push --allow-live

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Shopify admin → Online Store → Themes → Customize"
echo "2. Navigate to a product page"
echo "3. Configure the Teletransport Product section"
echo "4. Enable debug mode to verify connection"
echo ""
echo "Happy selling! 🎉"