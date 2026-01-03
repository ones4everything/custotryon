/**
 * ONES4 Print Designer - Main App Integration Example
 * Add this code to your main app file to connect with ONES4 store
 */

// Import the ONES4 integration
import ONES4Integration from './ones4-integration.js';
import CanvasSafetyWrapper from './canvas-safety-wrapper.js';

// Load configuration
const config = {
  "appName": "ONES4 Print Designer",
  "version": "1.0.0",
  "store": {
    "name": "ONES4",
    "domain": "jfg9tu-fb.myshopify.com",
    "publicDomain": "www.ones4.com",
    "environment": "production"
  },
  "integration": {
    "teletransportSection": {
      "customizeToggle": "[data-customize-toggle]",
      "customizePanel": "[data-customize-panel]"
    }
  },
  "output": {
    "formats": {
      "webPreview": {
        "format": "image/png",
        "width": 800,
        "height": 600,
        "quality": 0.9
      }
    }
  }
};

class PrintDesignerApp {
  constructor() {
    this.canvas = null;
    this.canvasWrapper = new CanvasSafetyWrapper();
    this.integration = new ONES4Integration(config);
    this.currentProduct = null;
  }

  async initialize() {
    console.log('🎨 Initializing ONES4 Print Designer...');
    
    try {
      // Initialize canvas safely
      await this.initializeCanvas();
      
      // Connect to ONES4 store
      await this.connectToStore();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('✅ Print Designer initialized successfully!');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showError('Failed to initialize Print Designer. Please refresh and try again.');
    }
  }

  async initializeCanvas() {
    try {
      this.canvas = await this.canvasWrapper.initCanvas('design-canvas', {
        width: 800,
        height: 600,
        backgroundColor: 'transparent'
      });
      
      if (this.canvas) {
        console.log('✅ Canvas initialized successfully');
      }
    } catch (error) {
      console.error('❌ Canvas initialization failed:', error);
      throw error;
    }
  }

  async connectToStore() {
    try {
      const result = await this.integration.initialize();
      console.log('✅ Connected to ONES4 store:', result.store.name);
      
      // Listen for customize requests from the store
      this.integration.bindTeletransportEvents();
      
    } catch (error) {
      console.warn('⚠️ Store connection failed, running in offline mode:', error);
      // App continues to work without store integration
    }
  }

  setupEventListeners() {
    // Listen for customize requests from ONES4 store
    window.addEventListener('ones4-customize-product', (event) => {
      const { productData } = event.detail;
      this.handleCustomizeRequest(productData);
    });

    // Listen for background image changes
    document.addEventListener('change', (event) => {
      if (event.target.type === 'file' && event.target.accept?.includes('image')) {
        this.handleImageUpload(event.target.files[0]);
      }
    });

    // Save design button
    const saveButton = document.getElementById('save-design-btn');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveDesign());
    }

    // Add to cart button  
    const addToCartButton = document.getElementById('add-to-cart-btn');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => this.addToCart());
    }
  }

  handleCustomizeRequest(productData) {
    console.log('🎨 Customization requested for:', productData.title);
    this.currentProduct = productData;
    
    // Load product image as background
    if (productData.featured_image) {
      this.setBackgroundImage(productData.featured_image);
    }

    // Update UI with product info
    this.updateProductUI(productData);
  }

  async setBackgroundImage(imageUrl) {
    try {
      const success = await this.canvasWrapper.setBackgroundImage(imageUrl);
      if (success) {
        console.log('✅ Background image loaded');
      }
    } catch (error) {
      console.error('❌ Failed to set background image:', error);
      this.showError('Failed to load product image');
    }
  }

  async handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    try {
      const imageUrl = URL.createObjectURL(file);
      await this.setBackgroundImage(imageUrl);
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      this.showError('Failed to upload image');
    }
  }

  updateProductUI(productData) {
    // Update product title
    const titleElement = document.getElementById('product-title');
    if (titleElement) {
      titleElement.textContent = productData.title;
    }

    // Update product type
    const typeElement = document.getElementById('product-type');
    if (typeElement) {
      typeElement.textContent = productData.product_type || 'Customizable Product';
    }

    // Show/hide neon controls if it's a neon product
    const isNeon = this.integration.isNeonProduct(productData);
    const neonControls = document.getElementById('neon-controls');
    if (neonControls) {
      neonControls.style.display = isNeon ? 'block' : 'none';
    }
  }

  async saveDesign() {
    if (!this.canvasWrapper.isReady()) {
      this.showError('Canvas not ready');
      return;
    }

    try {
      const canvas = this.canvasWrapper.getCanvas();
      const previewUrl = await this.integration.generateWebPreview(canvas);
      
      // Save design data
      const designData = {
        productId: this.currentProduct?.id,
        previewUrl: previewUrl,
        timestamp: new Date().toISOString()
      };

      // Store in localStorage for now
      localStorage.setItem('ones4-current-design', JSON.stringify(designData));
      
      console.log('✅ Design saved');
      this.showSuccess('Design saved successfully!');
      
    } catch (error) {
      console.error('❌ Save design failed:', error);
      this.showError('Failed to save design');
    }
  }

  async addToCart() {
    if (!this.currentProduct) {
      this.showError('No product selected');
      return;
    }

    if (!this.canvasWrapper.isReady()) {
      this.showError('Design not ready');
      return;
    }

    try {
      const canvas = this.canvasWrapper.getCanvas();
      const previewUrl = await this.integration.generateWebPreview(canvas);
      
      // Get customization data
      const customText = document.getElementById('custom-text-input')?.value || '';
      const selectedMethod = document.querySelector('input[name="method"]:checked')?.value || 'Sublimation';

      // Add to ONES4 cart
      const result = await this.integration.addToCart({
        variantId: this.currentProduct.variants?.[0]?.id || this.currentProduct.id,
        quantity: 1,
        method: selectedMethod,
        customText: customText,
        previewDataUrl: previewUrl
      });

      console.log('✅ Added to cart:', result);
      this.showSuccess('Added to cart! Redirecting...');
      
      // Redirect to ONES4 store cart
      setTimeout(() => {
        window.location.href = 'https://www.ones4.com/cart';
      }, 1500);

    } catch (error) {
      console.error('❌ Add to cart failed:', error);
      this.showError('Failed to add to cart. Please try again.');
    }
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    if (type === 'error') {
      notification.style.background = '#ff4d8c';
      notification.style.color = 'white';
    } else if (type === 'success') {
      notification.style.background = '#5bffb5';
      notification.style.color = '#000';
    } else {
      notification.style.background = '#6ee9ff';
      notification.style.color = '#000';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          notification.parentNode?.removeChild(notification);
        }, 300);
      }
    }, 4000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new PrintDesignerApp();
    app.initialize();
    
    // Make app globally available
    window.printDesignerApp = app;
  });
} else {
  const app = new PrintDesignerApp();
  app.initialize();
  window.printDesignerApp = app;
}

// Export for module systems
export default PrintDesignerApp;