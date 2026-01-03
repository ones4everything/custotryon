/**
 * ONES4 Store Integration Helper for Print Designer App
 * Connects your C:\Users\Noe\customization\print-designer app to the ONES4 store
 */

class ONES4Integration {
  constructor(config) {
    this.config = config;
    this.store = config.store;
    this.apiBase = `https://${this.store.domain}`;
  }

  /**
   * Initialize connection to ONES4 store
   */
  async initialize() {
    console.log('🔗 Connecting Print Designer to ONES4 Store...');
    
    try {
      // Test store connection
      await this.testConnection();
      
      // Sync customizable products
      const products = await this.getCustomizableProducts();
      
      console.log(`✅ Connected to ${this.store.name}! Found ${products.length} customizable products.`);
      
      return {
        success: true,
        store: this.store,
        products: products
      };
    } catch (error) {
      console.error('❌ Store connection failed:', error);
      throw error;
    }
  }

  /**
   * Test connection to the store
   */
  async testConnection() {
    const response = await fetch(`${this.apiBase}/admin/api/${this.config.api.adminApiVersion}/shop.json`);
    
    if (!response.ok) {
      throw new Error(`Store connection failed: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Get all customizable products from the store
   */
  async getCustomizableProducts() {
    const tags = this.config.customization.enabledFor.tags.join(',');
    const url = `${this.apiBase}/admin/api/${this.config.api.adminApiVersion}/products.json?tags=${tags}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products || [];
  }

  /**
   * Get product details for customization
   */
  async getProductDetails(productId) {
    const url = `${this.apiBase}/admin/api/${this.config.api.adminApiVersion}/products/${productId}.json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${productId}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.product;
  }

  /**
   * Check if a product is customizable
   */
  isProductCustomizable(product) {
    const { tags, productTypes } = this.config.customization.enabledFor;
    
    // Check tags
    if (product.tags) {
      const productTags = product.tags.toLowerCase().split(', ');
      if (tags.some(tag => productTags.includes(tag.toLowerCase()))) {
        return true;
      }
    }
    
    // Check product type
    if (product.product_type) {
      if (productTypes.some(type => 
        type.toLowerCase() === product.product_type.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if product supports neon customization
   */
  isNeonProduct(product) {
    if (!product.tags) return false;
    
    const tags = product.tags.toLowerCase();
    return tags.includes('neon') || 
           tags.includes('neon-custom') || 
           tags.includes('neon-customizer') ||
           (product.product_type && product.product_type.toLowerCase().includes('neon'));
  }

  /**
   * Add customized product to cart
   */
  async addToCart(customizationData) {
    const cartData = {
      id: customizationData.variantId,
      quantity: customizationData.quantity || 1,
      properties: {}
    };

    // Add customization properties
    if (customizationData.method) {
      cartData.properties[this.config.integration.lineItemProperties.method.replace('properties[', '').replace(']', '')] = customizationData.method;
    }
    
    if (customizationData.customText) {
      cartData.properties[this.config.integration.lineItemProperties.customText.replace('properties[', '').replace(']', '')] = customizationData.customText;
    }
    
    if (customizationData.design) {
      cartData.properties[this.config.integration.lineItemProperties.design.replace('properties[', '').replace(']', '')] = customizationData.design;
    }
    
    if (customizationData.previewDataUrl) {
      cartData.properties[this.config.integration.lineItemProperties.preview.replace('properties[', '').replace(']', '')] = customizationData.previewDataUrl;
    }

    const response = await fetch(`${this.apiBase}/cart/add.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cartData)
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Generate preview for web display
   */
  async generateWebPreview(designCanvas) {
    const { webPreview } = this.config.output.formats;
    
    return new Promise((resolve) => {
      designCanvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }, webPreview.format, webPreview.quality);
    });
  }

  /**
   * Generate high-res preview for production
   */
  async generateProductionFile(designCanvas) {
    const { printProduction } = this.config.output.formats;
    
    // Create high-res canvas
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = printProduction.width;
    highResCanvas.height = printProduction.height;
    
    const ctx = highResCanvas.getContext('2d');
    ctx.drawImage(designCanvas, 0, 0, printProduction.width, printProduction.height);
    
    return new Promise((resolve) => {
      highResCanvas.toBlob((blob) => {
        resolve(blob);
      }, printProduction.format, printProduction.quality);
    });
  }

  /**
   * Get neon customization data (fonts, glow effects)
   */
  async getNeonCustomizationData() {
    if (!this.config.neonEngine.enabled) {
      return { fonts: [], glows: [] };
    }

    // This would typically come from Shopify metaobjects
    // For now, return default data structure
    return {
      fonts: [
        {
          name: 'Cyber',
          family: 'Orbitron',
          src: null,
          offset: 0
        },
        {
          name: 'Neon',
          family: 'Space Grotesk',
          src: null,
          offset: -5
        }
      ],
      glows: [
        {
          name: 'Electric Blue',
          primary: '#00aeff',
          secondary: 'rgba(0, 174, 255, 0.5)',
          blur: 20
        },
        {
          name: 'Neon Green',
          primary: '#00ff8a',
          secondary: 'rgba(0, 255, 138, 0.5)',
          blur: 18
        },
        {
          name: 'Hot Pink',
          primary: '#ff00c8',
          secondary: 'rgba(255, 0, 200, 0.5)',
          blur: 22
        }
      ]
    };
  }

  /**
   * Listen for teletransport section events
   */
  bindTeletransportEvents() {
    // Listen for customize button clicks
    document.addEventListener('click', (event) => {
      const customizeToggle = event.target.closest(this.config.integration.teletransportSection.customizeToggle);
      
      if (customizeToggle) {
        event.preventDefault();
        this.onCustomizeRequest(event);
      }
    });
  }

  /**
   * Handle customize request from teletransport section
   */
  onCustomizeRequest(event) {
    console.log('🎨 Customize request received from ONES4 store');
    
    // Extract product data from the page
    const productData = this.extractProductData();
    
    // Open your Print Designer app with this product
    this.openDesigner(productData);
  }

  /**
   * Extract product data from the current page
   */
  extractProductData() {
    // Extract from Shopify's built-in product JSON
    const productScript = document.querySelector('script[data-product-json], #ProductJson-template');
    
    if (productScript) {
      try {
        return JSON.parse(productScript.textContent);
      } catch (e) {
        console.warn('Failed to parse product JSON');
      }
    }

    // Fallback: extract from page elements
    return {
      id: this.getMetaProperty('product:id'),
      title: document.querySelector('.product-title, h1')?.textContent?.trim(),
      vendor: this.getMetaProperty('product:vendor'),
      type: this.getMetaProperty('product:type')
    };
  }

  /**
   * Get meta property value
   */
  getMetaProperty(property) {
    const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  /**
   * Open your Print Designer app with product data
   */
  openDesigner(productData) {
    // This is where you'd integrate with your actual Print Designer app
    console.log('🚀 Opening Print Designer for product:', productData);
    
    // Post message to your app with product data
    if (window.printDesigner) {
      window.printDesigner.openProduct(productData);
    }
    
    // Send product data via postMessage for iframe integration
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ONES4_CUSTOMIZE_PRODUCT',
        productData: productData
      }, '*');
    }
    
    // Trigger custom event for your app to listen to
    window.dispatchEvent(new CustomEvent('ones4-customize-product', {
      detail: { productData }
    }));
    
    // Store product data in sessionStorage for your app to access
    sessionStorage.setItem('ones4-product-data', JSON.stringify(productData));
    
    // Or redirect to your app with product data
    // window.location.href = `file:///C:/Users/Noe/customization/print-designer/index.html?product=${productData.id}`;
  }

  /**
   * Safe canvas initialization helper
   */
  initializeCanvas(canvasElement, options = {}) {
    if (!canvasElement) {
      console.warn('Canvas element not found');
      return null;
    }

    // Wait for element to be fully rendered
    return new Promise((resolve) => {
      const checkCanvas = () => {
        if (canvasElement.offsetWidth > 0 && canvasElement.offsetHeight > 0) {
          // Canvas is ready
          const defaultOptions = {
            width: canvasElement.offsetWidth || 800,
            height: canvasElement.offsetHeight || 600,
            backgroundColor: 'transparent'
          };
          
          const finalOptions = { ...defaultOptions, ...options };
          resolve(finalOptions);
        } else {
          // Wait a bit more
          requestAnimationFrame(checkCanvas);
        }
      };
      checkCanvas();
    });
  }

  /**
   * Safe image loading helper
   */
  loadImageSafely(imageUrl) {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('No image URL provided'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (img.width > 0 && img.height > 0) {
          resolve(img);
        } else {
          reject(new Error('Image loaded but has no dimensions'));
        }
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  }
}

// Usage Example:
/*
// Load configuration (choose one method):

// Method 1: ES6 import (TypeScript)
import { printDesignerConfig as config } from './print-designer-config';

// Method 2: CommonJS (Node.js)
const { printDesignerConfig: config } = require('./print-designer-config');

// Method 3: Direct config object
const config = {
  store: { domain: 'jfg9tu-fb.myshopify.com', publicDomain: 'www.ones4.com' },
  integration: { teletransportSection: { customizeToggle: '[data-customize-toggle]' } }
};

// Initialize integration
const ones4Integration = new ONES4Integration(config);

// Connect to store
ones4Integration.initialize().then(result => {
  console.log('Store connection successful:', result);
  
  // Bind events
  ones4Integration.bindTeletransportEvents();
  
}).catch(error => {
  console.error('Store connection failed:', error);
});
*/

export default ONES4Integration;