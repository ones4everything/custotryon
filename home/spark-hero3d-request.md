# ONES4 Hero3D Homepage - Spark Request

## Project Overview
Design and implement a full homepage for ONES4, centered around an immersive Hero3D experience with a premium dark UI aesthetic. The hero features a 3D planet sphere with a looping video texture (season/lighting morph) and scroll-driven orbiting product callouts.

---

## Technical Stack
- **Framework:** React + Vite
- **3D Engine:** Three.js / React Three Fiber
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **Performance:** Web-optimized, lazy-loaded assets

---

## Homepage Structure

### 1. Navigation Bar (Sticky Header)
**Layout:**
- Left: Hamburger menu icon
- Center: ONES4 logo
- Right of logo: Search bar with **microphone icon**
- Right side: Profile icon, Cart icon

**Style:**
- Height: 64px
- Background: transparent or deep navy (#020617)
- Icons: white with cyan accent on hover
- Sticky on scroll with blur backdrop

**Search Bar:**
- Rounded pill shape
- Neon cyan glow on focus
- Microphone icon inside right end
- Placeholder: "Search…"

---

### 2. Hero3D Section (Primary Focus)

#### Central Element: Video-Textured Planet Sphere
**PlanetCore Component:**
- `SphereGeometry` with 64x64 segments (32x32 on mobile for performance)
- Video texture using `useVideoTexture()` from @react-three/drei
- Video: Looping season morph (Moon → Sun → Moon) - `/public/video/planet-seasons.mp4`
- Video settings: `loop: true, muted: true, start: true, playsInline: true`

**Material Properties:**
```javascript
meshStandardMaterial({
  map: videoTexture,
  toneMapped: false,
  roughness: 0.35,
  metalness: 0.6,
  emissive: "#ffffff",
  emissiveIntensity: 0.4
})
```

**Rotation Logic (Critical):**
- Video content loops continuously (ambient season morph)
- Sphere mesh rotation driven **ONLY** by scroll progress
- Static when user stops scrolling (no auto-rotation)
- On hover: moderate rotation speed, smooth return to scroll-driven on hover end
- Formula: `rotation.y = scrollProgress * Math.PI * 2`

**Fallback:**
- React.Suspense wrapper
- Wireframe sphere (cyan #00ffff, low opacity) while video loads

---

#### Initial State: 4 Static Categories
At scroll position 0, display 4 category cards around the center:
- **Wearables**
- **Computing**
- **Displays**
- **Components**

**Style:**
- Connected to center with subtle 3D lines
- Glowing node points at connections
- Tight positioning (x: ±1.8, y: ±0.8)

---

#### Scroll Transition Sequence
As user scrolls:
1. Categories fade out **one by one** (staggered)
2. Center sphere activates (tilts and spins based on scroll)
3. Neon orbit rings fade in and expand
4. 4 Products appear **one by one** (as each category fades)

**Products:**
- Neural Link
- Quantum Core
- Holo Lens
- Cyber Deck

---

#### Orbiting Product Callouts
**Style:**
- 3-4 items per ring maximum
- Mini-cards: icon + short label (NOT full product cards)
- Uniform size: `min-w-[200px]`
- Evenly spaced on orbit rings

**Interaction:**
- On hover/focus: expand to show larger image, description, price
- Neon glow effect: `box-shadow: 0 0 30px var(--neon-cyan)`
- Scale animation on hover
- ARIA labels for accessibility
- `tabIndex` management (only focusable when visible)

**Animation:**
- Staggered reveal based on scroll progress
- Smooth opacity and position transitions
- No abrupt pop-in

---

#### Floating Text Callouts (Parallax)
Short phrases that glide across screen on parallax paths:
- "Immersive commerce hardware"
- "AI-driven shopping"
- "Classical meets quantum"

**Behavior:**
- Fade in/out at different scroll positions
- Never obscure center device or orbiting items
- Horizontal parallax movement
- Lightweight CSS/JS (IntersectionObserver + transform/opacity)

---

#### Extended Scroll Area
- Container height: 450vh
- Sticky positioning keeps 3D scene pinned during scroll
- Long "runway" for storytelling elements

---

#### Environment
- Stars background (`<Stars />` from @react-three/drei)
- Directional light (intensity 2.0) as "Sun" key light
- Cyan/Magenta spotlights as rim/fill lights
- Shadows enabled (castShadow, receiveShadow)

---

### 3. NO Bottom Product Grid
**Important:** Remove ALL product grids, carousels, or lists below the hero. Products appear ONLY on orbit rings.

---

### 4. Footer
- Minimal links
- Muted text (rgba(255,255,255,0.5))
- Dark background (#000000)
- Clean spacing

---

## Design System

### Color Palette
```css
:root {
  /* Background */
  --black: #000000;
  --deep-navy: #020617;
  --dark-blue: #0b1220;
  
  /* Primary Accent */
  --cyan-blue: #22d3ee;
  --electric-teal: #06b6d4;
  --neon-cyan: #00ffff;
  --neon-magenta: #ff00ff;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.5);
  
  /* Status */
  --success: #22c55e;
  --warning: #facc15;
  --error: #ef4444;
}
```

### Typography
- **Font Stack:** Inter / System UI / Roboto / sans-serif
- **H1 (Hero):** 48–64px / Bold
- **H2:** 32–40px / Semibold
- **H3:** 24–28px / Semibold
- **Body:** 14–16px / Regular
- **Caption:** 12px / Medium

### Spacing System
4px base scale: 4, 8, 12, 16, 24, 32, 48, 64

---

## Performance Requirements
- Lazy load video texture
- Reduce sphere segments on mobile (32x32)
- Low draw calls
- Web-optimized assets
- Sub-2-second load time
- Clean up resources on unmount (pause video, dispose texture)

---

## Accessibility Requirements
- WCAG 2.2 AA contrast compliance
- ARIA labels on all interactive elements
- Keyboard navigation for orbiting callouts
- `prefers-reduced-motion` support:
  - If enabled: pause video OR render static frame
  - Minimal rotation
- Focus visible states on all interactive elements

---

## Responsive Breakpoints
- **Mobile:** < 768px
  - Simplified orbit (vertical/horizontal slider)
  - 32x32 sphere segments
  - No bottom product grid
  - Adjusted orbit radius and tilt
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px (full experience)

---

## File Structure
```
hero3d/
├── components/
│   ├── Hero3D.tsx         (main hero component)
│   ├── PlanetCore.tsx     (video sphere)
│   ├── Header.tsx         (navigation)
│   └── Footer.tsx
├── public/
│   └── video/
│       └── planet-seasons.mp4
├── App.tsx
└── index.html
```

---

## Reference Assets
- `ChatGPT Image Jan 7, 2026, 05_05_14 AM.png`
- `ChatGPT Image Jan 7, 2026, 07_26_05 AM.png`
- `Firefly 3D 360 BLENDER SCENE (SUN–MOON SEASON TRANSITION).mp4`
- `Firefly_Flux_A seamless, loopable cinematic sequence...820135.jpg`
- `Google_AI_Studio_2026-01-07T11_21_49.436Z.png`
- `Google_AI_Studio_2026-01-07T11_21_51.062Z.png`

---

## Acceptance Checklist
- [ ] Center object is a sphere with looping mp4 texture (season morph)
- [ ] Sphere rotation changes only when scroll changes; stops when user stops
- [ ] Video continues looping even when scroll is not moving
- [ ] Suspense fallback displays quickly (wireframe sphere)
- [ ] 4 categories visible initially, transition to 4 products on scroll
- [ ] Orbits/callouts remain clean (3-4 per ring, mini-cards only)
- [ ] NO product grid appears below the hero
- [ ] Mobile works (muted autoplay, playsInline)
- [ ] Reduced-motion is respected
- [ ] Search bar has microphone icon
- [ ] Floating text callouts appear on parallax paths
- [ ] All interactive elements are keyboard accessible with ARIA labels
