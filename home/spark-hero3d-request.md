# ONES4 Hero3D Homepage - Lovable Update Request

## Project Overview
Update the existing ONES4 homepage to feature a **4-chapter seasonal scroll experience** with the Hero3D sphere as the central "Management Hub." Each chapter represents a season and contains different product content. The sphere remains sticky throughout, transitioning its video texture to match each season as the user scrolls.

---

## Technical Stack
- **Framework:** React + Vite
- **3D Engine:** Three.js / React Three Fiber
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **Scroll Behavior:** CSS Scroll-Snap + IntersectionObserver
- **Performance:** Web-optimized, lazy-loaded assets

---

## Core Concept: 4 Seasonal Chapters

The page is divided into **4 full-screen chapters**, each with:
- Unique seasonal background (matching attached reference images)
- Different product content orbiting the sphere
- Scroll-snap behavior for natural chapter locking
- Mobile-friendly chapter markers

| Chapter | Season | Content | Background |
|---------|--------|---------|------------|
| 1 | 🌸 Spring | **Menu/Categories** | Cherry blossoms, fresh greens |
| 2 | ☀️ Summer | **Seasonal Products** | Bright sun, warm golden tones |
| 3 | 🍂 Autumn | **Best Selling Products** | Orange/red leaves, harvest mood |
| 4 | ❄️ Winter | **Sale Items** | Snow, cool blue/white tones |

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

### 2. Chapter Markers (Mobile-Friendly Navigation)

**Fixed sidebar/dots navigation:**
```
○ Menu (Spring)
○ Seasonal (Summer)  
○ Best Sellers (Autumn)
○ Sale (Winter)
```

**Desktop:**
- Vertical dots on right side
- Labels appear on hover
- Active chapter highlighted with glow

**Mobile:**
- Horizontal dots at bottom of screen
- Tap to jump to chapter
- Swipe-friendly
- Current chapter indicator with season icon

**Implementation:**
```css
.chapter-nav {
  position: fixed;
  z-index: 100;
}

/* Desktop: right side */
@media (min-width: 768px) {
  .chapter-nav {
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
  }
}

/* Mobile: bottom */
@media (max-width: 767px) {
  .chapter-nav {
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
  }
}
```

---

### 3. Scroll-Snap Container

**Critical:** Enable snap-to-chapter scrolling so each chapter locks naturally.

```css
.chapters-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.chapter {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  height: 100vh;
  position: relative;
}
```

**Behavior:**
- Scrolling naturally locks onto Menu → Seasonal → Best Sellers → Sale
- Smooth scroll animation between chapters
- Works with mouse wheel, touch swipe, and keyboard

---

### 4. Hero3D Sphere (Sticky Management Center)

#### The Sphere Stays Fixed Throughout All 4 Chapters

**Position:**
- Centered on screen
- `position: sticky` or fixed overlay
- Remains visible as background chapters scroll behind it

**Video Texture Transitions:**
The sphere's video texture (season morph) syncs with the current chapter:

| Scroll Position | Sphere State |
|-----------------|--------------|
| Chapter 1 (0-25%) | 🌸 Spring phase of video |
| Chapter 2 (25-50%) | ☀️ Summer phase of video |
| Chapter 3 (50-75%) | 🍂 Autumn phase of video |
| Chapter 4 (75-100%) | ❄️ Winter phase of video |

**Implementation:**
```javascript
// Sync video playback position with scroll
const videoRef = useRef();
const { scrollYProgress } = useScroll();

useMotionValueEvent(scrollYProgress, "change", (progress) => {
  if (videoRef.current) {
    // Map scroll to video time (0-100% scroll = 0-100% video)
    videoRef.current.currentTime = progress * videoRef.current.duration;
  }
});
```

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

---

### 5. Chapter 1: Menu/Categories (🌸 Spring)

**Background:** Spring imagery - cherry blossoms, fresh greens, new growth

**Content:** 4 Category cards orbiting the sphere:
- **Wearables** 
- **Computing**
- **Displays**
- **Components**

**Behavior:**
- Categories connected to sphere with subtle 3D lines
- Glowing node points at connections
- On scroll down: categories fade out, transition to Chapter 2

---

### 6. Chapter 2: Seasonal Products (☀️ Summer)

**Background:** Summer imagery - bright sun, golden warmth, beach vibes

**Content:** 4 Featured seasonal products orbiting:
- Summer Collection Item 1
- Summer Collection Item 2
- Summer Collection Item 3
- Summer Collection Item 4

**Behavior:**
- Products fade in as summer phase begins
- Orbit rings visible with neon glow
- Mini-cards with hover expansion

---

### 7. Chapter 3: Best Selling Products (🍂 Autumn)

**Background:** Autumn imagery - orange/red leaves, harvest, warm earth tones

**Content:** 4 Best sellers orbiting:
- Best Seller #1
- Best Seller #2
- Best Seller #3
- Best Seller #4

**Behavior:**
- "🔥 Best Seller" badges on cards
- Sales count or rating visible
- Prominent CTA buttons

---

### 8. Chapter 4: Sale Items (❄️ Winter)

**Background:** Winter imagery - snow, cool blue/white, holiday vibes

**Content:** 4 Sale items orbiting:
- Sale Item 1 (% off badge)
- Sale Item 2 (% off badge)
- Sale Item 3 (% off badge)
- Sale Item 4 (% off badge)

**Behavior:**
- "❄️ SALE" badges with discount percentage
- Original price crossed out
- Urgency indicators (limited time)

---

### 9. Orbiting Product Callouts (All Chapters)

**Style:**
- 4 items per chapter maximum
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

### 10. Seasonal Backgrounds

Each chapter has a full-screen background that matches the season:

```css
.chapter-spring {
  background: url('/backgrounds/spring.jpg') center/cover;
  /* Overlay for readability */
  background-color: rgba(0, 0, 0, 0.6);
  background-blend-mode: overlay;
}

.chapter-summer {
  background: url('/backgrounds/summer.jpg') center/cover;
  background-color: rgba(0, 0, 0, 0.5);
  background-blend-mode: overlay;
}

.chapter-autumn {
  background: url('/backgrounds/autumn.jpg') center/cover;
  background-color: rgba(0, 0, 0, 0.6);
  background-blend-mode: overlay;
}

.chapter-winter {
  background: url('/backgrounds/winter.jpg') center/cover;
  background-color: rgba(0, 0, 0, 0.5);
  background-blend-mode: overlay;
}
```

---

### 11. Footer (After Chapter 4)
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
- [ ] **Scroll-Snap:** Page snaps naturally to each of the 4 chapters (Menu → Seasonal → Best Sellers → Sale)
- [ ] **Chapter Markers:** Mobile-friendly navigation dots (vertical on desktop, horizontal on mobile)
- [ ] **Sticky Sphere:** Hero3D sphere remains fixed/sticky throughout all 4 chapters
- [ ] **Season Sync:** Sphere video texture transitions match current chapter (Spring → Summer → Autumn → Winter)
- [ ] **Chapter 1 (Spring):** Shows 4 Categories orbiting (Wearables, Computing, Displays, Components)
- [ ] **Chapter 2 (Summer):** Shows 4 Seasonal Products orbiting
- [ ] **Chapter 3 (Autumn):** Shows 4 Best Selling Products with badges
- [ ] **Chapter 4 (Winter):** Shows 4 Sale Items with discount badges
- [ ] **Seasonal Backgrounds:** Each chapter has matching season background imagery
- [ ] **Mobile Works:** Touch swipe, muted autoplay, playsInline
- [ ] **Reduced-motion:** Respected for accessibility
- [ ] **Search Bar:** Has microphone icon
- [ ] **Keyboard Navigation:** All interactive elements accessible with ARIA labels
