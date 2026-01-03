// Quick Fix for src/server.ts
// Replace the problematic JSON import with this inline config:

/*
OLD CODE (causing the error):
import config from './print-designer-config.json';

NEW CODE (fixed):
*/
const printDesignerConfig = {
  appName: "ONES4 Print Designer",
  version: "1.0.0",
  store: {
    name: "ONES4",
    domain: "jfg9tu-fb.myshopify.com",
    publicDomain: "www.ones4.com",
    environment: "production"
  },
  api: {
    adminApiVersion: "2023-10",
    endpoints: {
      products: "/admin/api/2023-10/products.json",
      cart: "/cart/add.js"
    }
  },
  integration: {
    teletransportSection: {
      customizeToggle: "[data-customize-toggle]"
    }
  }
};

// Then use 'printDesignerConfig' instead of 'config' in your code
// Example: const integration = new ONES4Integration(printDesignerConfig);