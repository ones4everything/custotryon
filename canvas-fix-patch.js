/**
 * Canvas.js Error Fix for ONES4 Print Designer
 * 
 * This patch fixes the "Cannot read properties of null (reading 'width')" error
 * Apply this to your C:\Users\Noe\customization\print-designer\src\services\canvas.js
 */

// Add this safety check function at the top of your canvas.js file:
function safeCanvasOperation(canvas, operation, fallback = null) {
  try {
    if (!canvas || !canvas.width || !canvas.height) {
      console.warn('Canvas is null or has no dimensions, skipping operation');
      return fallback;
    }
    return operation(canvas);
  } catch (error) {
    console.error('Canvas operation failed:', error);
    return fallback;
  }
}

// Replace your problematic setBackgroundImage function with this safer version:
function setBackgroundImageSafely(imageUrl, backgroundImageOpacity = 1) {
  return new Promise((resolve, reject) => {
    const canvas = this.canvas || this.fabricCanvas;
    
    // Safety check
    if (!canvas) {
      console.error('Canvas not initialized');
      reject(new Error('Canvas not initialized'));
      return;
    }

    // Check if it's a Fabric.js canvas
    if (canvas.setBackgroundImage && typeof canvas.setBackgroundImage === 'function') {
      // Fabric.js approach
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        safeCanvasOperation(img, (loadedImg) => {
          if (loadedImg.width > 0 && loadedImg.height > 0) {
            canvas.setBackgroundImage(imageUrl, () => {
              canvas.backgroundImageOpacity = backgroundImageOpacity;
              canvas.renderAll();
              console.log('✅ Background image set successfully');
              resolve(true);
            }, {
              crossOrigin: 'anonymous'
            });
          } else {
            throw new Error('Image has no dimensions');
          }
        }, false);
      };
      
      img.onerror = (error) => {
        console.error('❌ Image failed to load:', imageUrl);
        
        // Use fallback solid background
        canvas.backgroundColor = '#f0f0f0';
        canvas.renderAll();
        reject(error);
      };
      
      img.src = imageUrl;
      
    } else {
      // Native canvas approach
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get 2D context from canvas'));
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        safeCanvasOperation(img, (loadedImg) => {
          if (loadedImg.width > 0 && loadedImg.height > 0) {
            ctx.globalAlpha = backgroundImageOpacity;
            ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0; // Reset
            console.log('✅ Background image drawn to native canvas');
            resolve(true);
          } else {
            throw new Error('Image has no dimensions');
          }
        }, false);
      };
      
      img.onerror = (error) => {
        console.error('❌ Native canvas image failed to load:', imageUrl);
        reject(error);
      };
      
      img.src = imageUrl;
    }
  });
}

// Initialize canvas with safety checks
function initializeCanvasSafely(canvasElementId, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const canvasElement = document.getElementById(canvasElementId);
      
      if (!canvasElement) {
        reject(new Error(`Canvas element '${canvasElementId}' not found`));
        return;
      }

      // Wait for element to be rendered
      const checkElement = () => {
        if (canvasElement.offsetWidth > 0 && canvasElement.offsetHeight > 0) {
          // Element is ready
          const defaultOptions = {
            width: canvasElement.offsetWidth,
            height: canvasElement.offsetHeight,
            backgroundColor: 'transparent'
          };

          const finalOptions = { ...defaultOptions, ...options };
          
          // Initialize Fabric.js if available
          if (window.fabric && window.fabric.Canvas) {
            const fabricCanvas = new fabric.Canvas(canvasElementId, finalOptions);
            resolve(fabricCanvas);
          } else {
            // Native canvas
            canvasElement.width = finalOptions.width;
            canvasElement.height = finalOptions.height;
            resolve(canvasElement);
          }
        } else {
          // Try again next frame
          requestAnimationFrame(checkElement);
        }
      };
      
      checkElement();
      
    } catch (error) {
      reject(error);
    }
  });
}

/* 
HOW TO APPLY THIS FIX:

1. Open your canvas.js file: C:\Users\Noe\customization\print-designer\src\services\canvas.js

2. Replace the problematic setBackgroundImage function with setBackgroundImageSafely

3. Add the safeCanvasOperation helper function at the top

4. Replace your canvas initialization with initializeCanvasSafely

5. Example usage in your code:

// Before (causing errors):
canvas.setBackgroundImage(imageUrl, backgroundImageOpacity);

// After (safe):
setBackgroundImageSafely(imageUrl, backgroundImageOpacity)
  .then(() => console.log('Success'))
  .catch(error => console.error('Failed:', error));

// Canvas initialization:
initializeCanvasSafely('my-canvas')
  .then(canvas => {
    console.log('Canvas ready:', canvas);
    // Now you can safely use the canvas
  })
  .catch(error => {
    console.error('Canvas init failed:', error);
  });
*/

export { safeCanvasOperation, setBackgroundImageSafely, initializeCanvasSafely };