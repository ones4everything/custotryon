Teletransport PDP Page Guide
============================

Scope
- This guide documents how the Teletransport PDP logic, toggles, and data hooks work.
- Primary source: `teletransport.liquid` (the logic mirrors into `productpage.txt` for reference).

Where the logic lives
- `teletransport.liquid` contains the HTML, CSS, and JS for the PDP.
- `productpage.txt` mirrors the section; keep it in sync if you edit outside Shopify.
- All JS logic is in a single IIFE scoped to `#teleporter-hub`.

Core toggles and UI states
- Minimal Mode: button `[data-minimal-toggle]` toggles `mode-minimal` on `<body>` and `is-minimal` on `#teleporter-hub`. Value persists in localStorage key `o4MinimalMode` and defaults to `prefers-reduced-motion` when no stored value exists.
- Menu: `.neo-menu-toggle` toggles the menu panel. It adds/removes `is-menu-open` on `.neo-header`, updates ARIA, closes on outside click or ESC, and supports a submenu state `is-submenu-open`.
- Customize panel: `[data-customize-toggle]` toggles `.customize-panel.is-open`. When open, all inputs are enabled; when closed, they are disabled and hero media resets to the active variant.
- VTO modal: `[data-vto-open]` opens, `[data-vto-close]` closes, ESC closes, and focus is trapped inside the dialog. Mode buttons use `data-vto-mode="camera|upload|model"` and update `data-vto-mode` on the modal for styling.
- Tabs: buttons with `data-tab` toggle `data-tab-panel` content, update `aria-selected`, and lazy-init review widgets (SPR/Judge.me).
- Quantity: `[data-qty-inc]` and `[data-qty-dec]` update the quantity input.

Variant, gallery, and hero logic
- Variant radios update the hidden `input[name="id"]` and sync pricing, hero media, and VTO overlays.
- Color chips carry `data-variant-id`, `data-hero-src`, `data-swatch`, and `data-neon` which drive the hero image and accent glow.
- Gallery dots and swatches use `data-gallery-index` to move the hero image and highlight the active dot.
- When a design is selected in customization, the hero image can switch to the design image (`data-design-hero`) while the panel is open.

Customization visibility rules
- Section setting `customization_toggle` is the default master switch.
- Product metafield `custom.customization_enabled` overrides (true/false).
- If `custom_product_types` is set, only those product types enable customization; non-matching types force it off.
- If still off, tags `customizable`, `personalized`, or `custom` enable it.

Customization inputs and pricing
- Methods are rendered from `custom.allowed_methods` (metafield), else default to Sublimation and Vinyl.
- Tag `no-sublimation` removes Sublimation; tag `vinyl-only` forces Vinyl.
- `custom.allowed_vinyl_types` restricts vinyl material pills.
- `custom.allowed_print_sizes` restricts size pills.
- Add-on pricing is calculated in JS (vinyl vs sublimation table) and shown via `[data-customize-fee]`.
- Total price display uses `[data-price-display]` and reflects base variant price + customization add-on.
- Selections are written into hidden inputs for main CTA and bottom bar.

Design list sources
- `custom.designs` metafield overrides the design list.
- If absent, section setting `custom_designs` is used.
- Supported formats:
  - CSV/line list: `Label` or `Label|https://image`
  - JSON array of strings or objects: `{ "label": "...", "image": "...", "hero": "..." }`

Neon customizer mode
- Enabled only when product is customizable and the product type or tags include `neon`, `neon-custom`, or `neon-customizer`.
- Pulls font/glow data from metaobjects `custom_font_def` and `glow_effect_def` into `#neon-engine-data`.
- Uses a different UI block (Cyber Text, Typography, Glow) and separate engine logic.

VTO data, modes, and cart properties
- Data source: `<script type="application/json" data-vto-data>` includes a `variants` map keyed by variant ID.
  - Each record must contain `overlay` (transparent PNG recommended).
  - Optional `models` array can replace the default 4 model tiles.
- Fallback overlay: if no overlay is found, the hero image is used (not ideal for garments).
- VTO modes:
  - Camera: uses `getUserMedia`, mirrored draw to canvas, stops tracks on close.
  - Upload: uses a local file, no upload by default.
  - Model: uses preset model images (assets `vto-model-1.jpg` to `vto-model-4.jpg` unless `models` array is present).
- VTO properties are appended only when VTO is used:
  - `Virtual Try-On Used`
  - `Virtual Try-On Mode`
  - `Virtual Try-On Model` (model mode only)
  - `Virtual Try-On Snapshot` (only after Save Snapshot)

Data attributes to preserve (JS hooks)
- Page root: `#teleporter-hub`
- Minimal toggle: `[data-minimal-toggle]`
- Menu: `.neo-menu-toggle`, `.neo-menu-panel`, `.neo-menu-item-link[data-menu-key]`, `.neo-submenu-panel[data-menu-panel]`
- Variant + gallery: `.variant-select`, `.color-chip[data-variant-id]`, `[data-gallery-index]`
- Customization: `[data-customize-toggle]`, `[data-customize-panel]`, `[data-customize-method]`, `[data-customize-material]`, `[data-customize-size]`, `[data-customize-design]`, `[data-customize-text]`
- VTO: `[data-vto-open]`, `[data-vto-close]`, `[data-vto-mode]`, `[data-vto-stage]`, `[data-vto-canvas]`, `[data-vto-upload]`
- Tabs: `[data-tabs]`, `[data-tab]`, `[data-tab-panel]`

Quick setup checklist
- Add overlay images to variant metafields `custom.vto_overlay` (preferred) or `vto.overlay`.
- Add model assets `vto-model-1.jpg` through `vto-model-4.jpg`, or define `models` in `data-vto-data`.
- If using customization, populate metafields: `custom.allowed_methods`, `custom.allowed_vinyl_types`, `custom.allowed_print_sizes`, `custom.designs`.
- If using neon customizer, ensure the product type or tags enable it and metaobjects are present.
