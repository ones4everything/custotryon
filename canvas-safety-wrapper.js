/**
 * Canvas Safety Wrapper for ONES4 Print Designer
 * Prevents null reference errors and handles canvas initialization safely
 */

class CanvasSafetyWrapper {
  constructor() {
    this.canvas = null;
    this.fabricCanvas = null;
    this.isInitialized = false;
  }

  /**
   * Safe canvas initialization
   */
  async initCanvas(canvasElementId, options = {}) {
    try {
      const canvasElement = document.getElementById(canvasElementId);
      
      if (!canvasElement) {
        throw new Error(`Canvas element with id '${canvasElementId}' not found`);
      }

      // Wait for element to be ready
      await this.waitForElement(canvasElement);

      // Default options
      const defaultOptions = {
        width: canvasElement.offsetWidth || 800,
        height: canvasElement.offsetHeight || 600,
        backgroundColor: 'transparent'
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Initialize Fabric.js canvas if available
      if (window.fabric && window.fabric.Canvas) {
        this.fabricCanvas = new fabric.Canvas(canvasElementId, finalOptions);
        this.canvas = this.fabricCanvas;
        console.log('✅ Fabric.js canvas initialized:', finalOptions);
      } else {
        // Fallback to native canvas
        this.canvas = canvasElement;
        this.canvas.width = finalOptions.width;
        this.canvas.height = finalOptions.height;
        console.log('✅ Native canvas initialized:', finalOptions);
      }

      this.isInitialized = true;
      return this.canvas;

    } catch (error) {
      console.error('❌ Canvas initialization failed:', error);
      this.handleCanvasError(error);
      return null;
    }
  }

  /**
   * Safe background image setting
   */
  async setBackgroundImage(imageUrl, options = {}) {
    if (!this.isInitialized || !this.canvas) {
      console.warn('Canvas not initialized, cannot set background image');
      return false;
    }

    try {
      const img = await this.loadImageSafely(imageUrl);
      
      if (this.fabricCanvas) {
        // Fabric.js approach
        this.fabricCanvas.setBackgroundImage(imageUrl, () => {
          this.fabricCanvas.renderAll();
          console.log('✅ Background image set with Fabric.js');
        }, {
          crossOrigin: 'anonymous',
          ...options
        });
      } else {
        // Native canvas approach
        const ctx = this.canvas.getContext('2d');
        if (ctx && img.width > 0 && img.height > 0) {
          ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
          console.log('✅ Background image set with native canvas');
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to set background image:', error);
      this.handleImageError(error, imageUrl);
      return false;
    }
  }

  /**
   * Safe image loading
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
      
      // Add timeout
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Image loading timeout'));
        }
      }, 10000); // 10 second timeout
      
      img.src = imageUrl;
    });
  }

  /**
   * Wait for element to be ready
   */
  waitForElement(element) {
    return new Promise((resolve) => {
      const checkElement = () => {
        if (element.offsetWidth > 0 && element.offsetHeight > 0) {
          resolve(element);
        } else {
          requestAnimationFrame(checkElement);
        }
      };
      checkElement();
    });
  }

  /**
   * Handle canvas errors gracefully
   */
  handleCanvasError(error) {
    console.error('Canvas Error:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4d8c;
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
    `;
    errorDiv.innerHTML = `
      <strong>⚠️ Canvas Error</strong><br>
      ${error.message}<br>
      <small>Please refresh the page and try again.</small>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Handle image loading errors
   */
  handleImageError(error, imageUrl) {
    console.error('Image Loading Error:', error, 'URL:', imageUrl);
    
    // Try to use a fallback image
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    
    if (this.canvas) {
      this.setBackgroundImage(fallbackImage).catch(() => {
        console.log('Fallback image also failed, using solid background');
        if (this.fabricCanvas) {
          this.fabricCanvas.backgroundColor = '#f0f0f0';
          this.fabricCanvas.renderAll();
        }
      });
    }
  }

  /**
   * Get canvas safely
   */
  getCanvas() {
    if (!this.isInitialized) {
      console.warn('Canvas not initialized yet');
      return null;
    }
    return this.canvas;
  }

  /**
   * Check if canvas is ready
   */
  isReady() {
    return this.isInitialized && this.canvas !== null;
  }

  /**
   * Cleanup canvas
   */
  dispose() {
    if (this.fabricCanvas && this.fabricCanvas.dispose) {
      this.fabricCanvas.dispose();
    }
    this.canvas = null;
    this.fabricCanvas = null;
    this.isInitialized = false;
    console.log('✅ Canvas cleaned up');
  }
}

// Usage Example:
/*
const canvasWrapper = new CanvasSafetyWrapper();

// Initialize canvas safely
canvasWrapper.initCanvas('my-canvas-id', {
  width: 800,
  height: 600
}).then((canvas) => {
  if (canvas) {
    console.log('Canvas ready!');
    
    // Set background image safely
    canvasWrapper.setBackgroundImage('path/to/product-image.jpg');
  }
}).catch(error => {
  console.error('Canvas initialization failed:', error);
});
*/

// Make it globally available
if (typeof window !== 'undefined') {
  window.CanvasSafetyWrapper = CanvasSafetyWrapper;
}

export default CanvasSafetyWrapper;