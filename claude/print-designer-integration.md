# 🚀 Ones4 Print Designer Integration Guide

## Overview
The teletransport overlay system now includes full integration hooks for your print-designer app, following the **customization philosophy** of one product page with dynamic method selection.

## ✅ Integration Points Available

### 1. **Global API Access**
```javascript
// Available immediately when teletransport loads
window.Ones4PrintDesigner = {
  // State management
  getState: () => ({ ...printDesignerState }),
  activate: (method) => activatePrintDesigner(method),
  deactivate: () => deactivatePrintDesigner(),
  
  // Tool management
  setTool: (tool) => setActiveTool(tool),
  
  // Canvas access
  getCanvas: () => printDesignerCanvas,
  getContext: () => printDesignerState.ctx,
  
  // Product data
  getProductId: () => variantSelect ? variantSelect.value : null,
  getHeroImage: () => heroImg,
  
  // Method workflow
  showWorkflow: (method) => showMethodWorkflow(method),
  
  // Update design preview
  updatePreview: (imageData) => { /* ... */ }
};
```

### 2. **Event System**
Listen for these custom events:

```javascript
// Designer activation
window.addEventListener('printDesignerActivated', (event) => {
  const { method, canvas, ctx, productId } = event.detail;
  // Initialize your print designer for the selected method
  MyPrintDesigner.init(method, canvas, productId);
});

// Designer deactivation
window.addEventListener('printDesignerDeactivated', (event) => {
  // Clean up your print designer
  MyPrintDesigner.cleanup();
});

// Tool changes
window.addEventListener('printDesignerToolChange', (event) => {
  const { tool, canvas } = event.detail;
  // Handle tool selection in your app
  MyPrintDesigner.setActiveTool(tool);
});
```

### 3. **Canvas Layer System**
The teletransport creates this layer stack:
```
z-index: 6  -> Design hint overlay
z-index: 5  -> Toolbar
z-index: 4  -> Your print designer canvas
z-index: 3  -> Design preview overlay
z-index: 2  -> Neon canvas (if enabled)
z-index: 1  -> Hero image
```

## 🎨 Method-Specific Workflows

### **Vinyl Workflow**
When method = "Vinyl":
1. Choose Material (Regular/3D Puff/Glow/Puff Glow)
2. Design Layout (Your app creates the design)
3. Set Size & Position (Your app handles placement)

### **Sublimation Workflow**  
When method = "Sublimation":
1. Full-color Design (Unlimited colors available)
2. Coverage Area (Choose print size and position)
3. Preview & Approve (Your app shows mockup)

## 🔧 Implementation Example

```javascript
// Wait for teletransport to load
document.addEventListener('DOMContentLoaded', () => {
  // Check if API is available
  if (window.Ones4PrintDesigner) {
    console.log('🎨 Print Designer API detected');
    
    // Set up event listeners
    window.addEventListener('printDesignerActivated', handleActivation);
    window.addEventListener('printDesignerDeactivated', handleDeactivation);
    window.addEventListener('printDesignerToolChange', handleToolChange);
  }
});

function handleActivation(event) {
  const { method, canvas, productId } = event.detail;
  
  // Initialize based on method
  if (method === 'Vinyl') {
    MyPrintDesigner.initVinyl(canvas, productId);
  } else if (method === 'Sublimation') {
    MyPrintDesigner.initSublimation(canvas, productId);
  }
  
  // Show your UI
  MyPrintDesigner.show();
}

function handleDeactivation(event) {
  // Hide your UI and clean up
  MyPrintDesigner.hide();
  MyPrintDesigner.cleanup();
}

function handleToolChange(event) {
  const { tool } = event.detail;
  MyPrintDesigner.setTool(tool);
}
```

## 🎯 Canvas Integration

### **Canvas Setup**
```javascript
function initPrintDesigner(canvas, method) {
  // Canvas is already sized to match hero image
  const ctx = canvas.getContext('2d');
  
  // Your design logic here
  setupDesignTools(ctx, method);
  
  // Enable interaction
  canvas.style.pointerEvents = 'auto';
}
```

### **Preview Updates**
```javascript
function updateDesignPreview(designData) {
  // Generate preview image
  const previewImage = generatePreview(designData);
  
  // Update through API
  window.Ones4PrintDesigner.updatePreview(previewImage);
  
  // This triggers printDesignerPreviewUpdate event
}
```

## 📊 Pricing Integration

The teletransport system automatically handles:
- ✅ Method-based pricing (Vinyl vs Sublimation)
- ✅ Material surcharges (3D Puff, Glow-in-dark, etc.)
- ✅ Size-based pricing (Small, Medium, Full front)
- ✅ Dynamic price updates in real-time

Your app just needs to focus on the design tools!

## 🚦 State Management

### **Current State Access**
```javascript
const state = window.Ones4PrintDesigner.getState();
console.log('Active method:', state.activeMethod);
console.log('Active tool:', state.activeTool);
console.log('Is active:', state.isActive);
```

### **Product Information**
```javascript
const productId = window.Ones4PrintDesigner.getProductId();
const heroImage = window.Ones4PrintDesigner.getHeroImage();
```

## 🎬 Philosophy Alignment

This integration follows the **customization philosophy**:
- ✅ **One product page** with method selector
- ✅ **Dynamic workflows** based on method selection  
- ✅ **Real-time pricing** updates automatically
- ✅ **Clean handoff** to your design tools
- ✅ **Method-specific UI** shows relevant options only

## 🔗 Next Steps

1. **Test the API**: Load a customizable product and check `window.Ones4PrintDesigner`
2. **Hook into events**: Add your activation/deactivation handlers
3. **Initialize canvas**: Set up your design tools when activated
4. **Update previews**: Use the preview API to show design changes
5. **Handle workflows**: Adapt your UI to Vinyl vs Sublimation workflows

The overlay is now **fully integrated** and ready for your print-designer app! 🎨✨