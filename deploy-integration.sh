#!/bin/bash

# ONES4 Print Designer Integration - Quick Deployment Script
echo "🚀 Deploying ONES4 Print Designer Integration..."

# Create backup directory
BACKUP_DIR="C:/Users/Noe/customization/print-designer/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing files
echo "📦 Creating backup..."
if [ -f "C:/Users/Noe/customization/print-designer/src/services/canvas.js" ]; then
    cp "C:/Users/Noe/customization/print-designer/src/services/canvas.js" "$BACKUP_DIR/"
fi

# Copy integration files
echo "📁 Copying integration files..."
cp "e:/Ones4-Main/website/ones4-integration.js" "C:/Users/Noe/customization/print-designer/"
cp "e:/Ones4-Main/website/print-designer-config.json" "C:/Users/Noe/customization/print-designer/"
cp "e:/Ones4-Main/website/canvas-safety-wrapper.js" "C:/Users/Noe/customization/print-designer/"
cp "e:/Ones4-Main/website/canvas-fix-patch.js" "C:/Users/Noe/customization/print-designer/"

# Create integration directory
mkdir -p "C:/Users/Noe/customization/print-designer/integration"
cp "e:/Ones4-Main/website/print-designer-integration.md" "C:/Users/Noe/customization/print-designer/integration/"
cp "e:/Ones4-Main/website/print-designer-demo.html" "C:/Users/Noe/customization/print-designer/integration/"

echo "✅ Integration files deployed!"
echo ""
echo "📋 Next Steps:"
echo "1. Apply canvas fixes to your canvas.js file"
echo "2. Import ONES4Integration in your main app file"
echo "3. Test the integration"
echo ""
echo "🔧 Backup created at: $BACKUP_DIR"