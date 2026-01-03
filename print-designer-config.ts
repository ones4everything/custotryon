/**
 * ONES4 Print Designer Configuration
 * TypeScript version to avoid JSON import issues
 */

export const printDesignerConfig = {
  appName: "ONES4 Print Designer",
  version: "1.0.0",
  store: {
    name: "ONES4",
    domain: "jfg9tu-fb.myshopify.com",
    publicDomain: "www.ones4.com",
    environment: "production" as const
  },
  api: {
    adminApiVersion: "2023-10",
    storefrontApiVersion: "2023-10",
    endpoints: {
      products: "/admin/api/2023-10/products.json",
      variants: "/admin/api/2023-10/variants.json",
      cart: "/cart/add.js",
      cartUpdate: "/cart/update.js"
    }
  },
  customization: {
    enabledFor: {
      tags: ["customizable", "personalized", "custom", "neon"],
      productTypes: ["T-Shirts", "Hoodies", "Tank Tops", "Neon Signs"],
      metafieldOverride: "custom.customization_enabled"
    },
    methods: {
      default: ["Sublimation", "Vinyl"],
      neonOnly: ["LED Cutting", "Acrylic Backing"]
    },
    textLimits: {
      maxCharacters: 12,
      minCharacters: 1
    }
  },
  neonEngine: {
    enabled: true,
    metaobjects: {
      fonts: "custom_font_def",
      glowEffects: "glow_effect_def"
    },
    canvas: {
      width: 1400,
      height: 1050,
      dpi: 300
    }
  },
  integration: {
    teletransportSection: {
      sectionId: "teletransport",
      customizeToggle: "[data-customize-toggle]",
      customizePanel: "[data-customize-panel]"
    },
    lineItemProperties: {
      method: "properties[Method]",
      customText: "properties[Custom Text]", 
      design: "properties[Design]",
      preview: "properties[_Preview]"
    }
  },
  output: {
    formats: {
      webPreview: {
        format: "image/png" as const,
        width: 800,
        height: 600,
        quality: 0.9
      },
      printProduction: {
        format: "image/png" as const,
        width: 4200,
        height: 3150,
        dpi: 300,
        quality: 1.0
      }
    }
  },
  features: {
    realTimePreview: true,
    designTemplates: true,
    fontManagement: true,
    colorPickers: true,
    layerSupport: true,
    undoRedo: true,
    exportOptions: true
  }
};

export default printDesignerConfig;