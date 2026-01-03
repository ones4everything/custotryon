import React, { useState, useRef, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Type, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  ShoppingBag, 
  RotateCcw,
  Shirt,
  Eye,
  EyeOff,
  X,
  RotateCw,
  ArrowUpToLine,
  ArrowDownToLine,
  Search,
  Camera,
  Upload,
  Move,
  Check,
  Layers,
  Glasses,
  Briefcase,
  LayoutTemplate,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertCircle,
  Loader2,
  Palette,
  Droplets
} from 'lucide-react';
import { FilesetResolver, FaceLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    Html, 
    Environment, 
    ContactShadows, 
    OrbitControls, 
    Float, 
    Stars, 
    PerspectiveCamera,
    Lightformer,
    Grid,
    MeshTransmissionMaterial,
    Text3D,
    Center
} from '@react-three/drei';
import * as THREE from 'three';

// --- Suppress Specific Info Logs ---
// MediaPipe logs "Created TensorFlow Lite XNNPACK delegate for CPU" as INFO, which can be mistaken for an error.
const originalInfo = console.info;
const originalLog = console.log;
const originalWarn = console.warn;

const shouldSuppress = (args: any[]) => {
  const msg = args[0];
  return typeof msg === 'string' && msg.includes("Created TensorFlow Lite XNNPACK delegate for CPU");
};

console.info = (...args) => {
  if (shouldSuppress(args)) return;
  originalInfo.call(console, ...args);
};

console.log = (...args) => {
  if (shouldSuppress(args)) return;
  originalLog.call(console, ...args);
};

console.warn = (...args) => {
  if (shouldSuppress(args)) return;
  originalWarn.call(console, ...args);
};

// --- Types ---
type ProductType = 'tshirt' | 'hoodie' | 'sunglasses' | 'tote' | 'fannypack';
type TextureType = 'none' | 'vinyl' | 'glow' | 'puff' | 'metallic';

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'rect';
  content: string; // text or image src
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color?: string; // for text/rect
  fontFamily?: string;
  fontSize?: number;
  texture?: TextureType;
  lockAspectRatio?: boolean;
  // New Effects
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

interface Preset {
  name: string;
  elements: Partial<DesignElement>[];
}

// --- Constants ---
const FONT_OPTIONS = [
  { name: 'Inter', label: 'Modern Sans' },
  { name: 'Space Grotesk', label: 'Tech Sans' },
  { name: 'Orbitron', label: 'Cyberpunk' },
  { name: 'Pacifico', label: 'Handwritten' },
  { name: 'Anton', label: 'Bold Display' },
  { name: 'Lobster', label: 'Fun Script' },
  { name: 'Playfair Display', label: 'Elegant Serif' },
  { name: 'Monoton', label: 'Retro Neon' },
  { name: 'Bangers', label: 'Comic Pow' },
  { name: 'Permanent Marker', label: 'Marker' },
  { name: 'Righteous', label: 'Sci-Fi' },
];

const TEXTURE_OPTIONS: { id: TextureType; label: string; description: string }[] = [
  { id: 'none', label: 'Matte', description: 'Standard flat print' },
  { id: 'vinyl', label: 'Vinyl', description: 'Glossy & high contrast' },
  { id: 'glow', label: 'Glow', description: 'Luminous neon effect' },
  { id: 'puff', label: 'Puff', description: 'Raised 3D texture' },
  { id: 'metallic', label: 'Metallic', description: 'Shimmering gradient' },
];

const PRESETS: Preset[] = [
  {
    name: 'Cyberpunk',
    elements: [
      { type: 'text', content: 'NEON', x: 40, y: 40, fontSize: 40, fontFamily: 'Orbitron', color: '#57f6ff', texture: 'glow', rotation: 0, lockAspectRatio: true, strokeWidth: 0, shadowBlur: 0 },
      { type: 'text', content: 'CITY', x: 60, y: 90, fontSize: 30, fontFamily: 'Orbitron', color: '#ff62e5', texture: 'vinyl', rotation: 0, lockAspectRatio: true, strokeWidth: 0, shadowBlur: 0 }
    ]
  },
  {
    name: 'Retro Wave',
    elements: [
      { type: 'text', content: 'Retro', x: 30, y: 50, fontSize: 45, fontFamily: 'Pacifico', color: '#ffbd00', texture: 'puff', rotation: -5, lockAspectRatio: true, strokeWidth: 2, strokeColor: '#000000' },
      { type: 'text', content: 'VIBES', x: 80, y: 100, fontSize: 35, fontFamily: 'Anton', color: '#00e6ff', texture: 'vinyl', rotation: 0, lockAspectRatio: true, shadowBlur: 0 }
    ]
  },
  {
    name: 'Street',
    elements: [
      { type: 'text', content: 'URBAN', x: 20, y: 60, fontSize: 38, fontFamily: 'Anton', color: '#ffffff', texture: 'metallic', rotation: 90, lockAspectRatio: true, strokeWidth: 1, strokeColor: '#000000' },
      { type: 'text', content: 'LEGEND', x: 70, y: 60, fontSize: 38, fontFamily: 'Anton', color: '#ffffff', texture: 'none', rotation: 90, lockAspectRatio: true, shadowOffsetX: 5, shadowOffsetY: 5, shadowBlur: 0, shadowColor: '#000000' }
    ]
  }
];

// --- SVGs ---
const TshirtSVG = ({ fill = "#1a1e2e" }) => (
  <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl neon-svg">
    <path fill={fill} stroke="rgba(126, 234, 255, 0.6)" strokeWidth="3" d="M378.5,64.5c-16.1,19.9-46,18.8-46,18.8s-29.4-1.1-46.6-19.9c-2.4-2.6-6-3.7-9.4-2.8 C242,70.3,205.5,84.1,173.2,99.2c-5.9,2.8-12.9,1.7-17.7-2.8l-40.4-38.1c-6.1-5.8-15.8-5.3-21.3,1.1L39.7,134.1 c-4.8,5.6-4.7,13.9,0.2,19.4l46.2,51.9c5.1,5.7,12.7,8.5,20.3,7.4l0.7-0.1c4.5-0.6,9-0.9,13.5-0.9v219.7c0,11,9,20,20,20h230.8 c11,0,20-9,20-20V211.8c4.5,0,9,0.3,13.5,0.9l0.7,0.1c7.6,1.1,15.2-1.7,20.3-7.4l46.2-51.9c4.9-5.5,5-13.8,0.2-19.4l-54.1-74.7 C412.7,53.4,403,52.9,396.9,58.7l-40.4,38.1c-4.8,4.5-11.8,5.6-17.7,2.8C306.5,84.1,270,70.3,235.5,60.6 C232.1,59.7,228.5,60.8,226.1,63.4L378.5,64.5z"/>
  </svg>
);

const HoodieSVG = ({ fill = "#1a1e2e" }) => (
  <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl neon-svg">
    <path fill={fill} stroke="rgba(126, 234, 255, 0.6)" strokeWidth="3" d="M366.4,121.7c-4.9-7.3-10.4-14.1-16.5-20.2c-0.6-0.6-1.3-1.2-1.9-1.8c-23.8-23.1-56.1-37.4-91.9-37.4s-68.1,14.3-91.9,37.4c-0.6,0.6-1.3,1.2-1.9,1.8c-6.1,6.1-11.6,12.9-16.5,20.2c-5.5,8.2-19.4,31.7-19.4,31.7l-47.5,39.1c-7.3,6-11.5,15.1-11.5,24.5v186.6c0,17.7,14.3,32,32,32h314.5c17.7,0,32-14.3,32-32V185c0-9.4-4.2-18.4-11.5-24.5l-47.5-39.1C386.7,121.7,371.9,129.9,366.4,121.7z M256,92c23.5,0,45.3,8.4,62.3,22.3c-1.3-0.3-2.6-0.5-3.9-0.5c-11.9,0-22.3,6.3-28.3,15.8c-5.1,8.1-16.5,8.1-21.6,0c-6-9.5-16.4-15.8-28.3-15.8c-1.3,0-2.6,0.2-3.9,0.5C210.7,100.4,232.5,92,256,92z M353.9,330.6l-19.2,57.7c-3,9.1-11.6,15.2-21.2,15.2h-115c-9.6,0-18.2-6.1-21.2-15.2l-19.2-57.7c-4.6-13.8,5.7-28.1,20.3-28.1h155.2C348.2,302.5,358.5,316.8,353.9,330.6z"/>
  </svg>
);

const SunglassesSVG = ({ fill = "#1a1e2e" }) => (
    <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl neon-svg">
      <defs>
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a3040" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a1e2e" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path fill={fill} stroke="rgba(126, 234, 255, 0.6)" strokeWidth="3" d="M448,160c-15.9,0-30.8,3.6-44.2,10.1c-15.5-22.6-41.2-37.4-70.5-37.4c-42.6,0-78.1,31.2-86.4,72.1 c-8.3-40.9-43.8-72.1-86.4-72.1c-29.3,0-55,14.8-70.5,37.4C76.4,163.6,61.5,160,45.6,160C20.5,160,0,180.5,0,205.6v32 c0,8.8,7.2,16,16,16h16c8.8,0,16-7.2,16-16v-16c0-6.6,5.4-12,12-12c8.2,0,15.7,2.1,22.2,5.7c-3.8,11.5-5.9,23.8-5.9,36.6 c0,66.3,53.7,120,120,120s120-53.7,120-120c0-6.7-0.6-13.3-1.7-19.7c-1.1,6.4-1.7,13-1.7,19.7c0,66.3,53.7,120,120,120 s120-53.7,120-120c0-12.8-2.1-25.1-5.9-36.6c6.5-3.6,14-5.7,22.2-5.7c6.6,0,12,5.4,12,12v16c0,8.8,7.2,16,16,16h16 c8.8,0,16-7.2,16-16v-32C512,180.5,491.5,160,466.4,160H448z M140.8,332c-48.6,0-88-39.4-88-88c0-48.6,39.4-88,88-88 s88,39.4,88,88C228.8,292.6,189.4,332,140.8,332z M371.2,332c-48.6,0-88-39.4-88-88c0-48.6,39.4-88,88-88s88,39.4,88,88 C459.2,292.6,419.8,332,371.2,332z"/>
      <circle cx="140.8" cy="244" r="80" fill="url(#lensGrad)" opacity="0.8" />
      <circle cx="371.2" cy="244" r="80" fill="url(#lensGrad)" opacity="0.8" />
    </svg>
);

const ToteSVG = ({ fill = "#1a1e2e" }) => (
    <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl neon-svg">
      <path fill={fill} stroke="rgba(126, 234, 255, 0.6)" strokeWidth="3" d="M376,144h-40v-24c0-44.2-35.8-80-80-80s-80,35.8-80,80v24h-40c-26.5,0-48,21.5-48,48v224c0,26.5,21.5,48,48,48h240 c26.5,0,48-21.5,48-48V192C424,165.5,402.5,144,376,144z M208,120c0-26.5,21.5-48,48-48s48,21.5,48,48v24h-96V120z M392,416 c0,8.8-7.2,16-16,16H136c-8.8,0-16-7.2-16-16V192c0-8.8,7.2-16,16-16h40v32c0,8.8,7.2,16,16,16s16-7.2,16-16v-32h96v32 c0,8.8,7.2,16,16,16s16-7.2,16-16v-32h40c8.8,0,16,7.2,16,16V416z"/>
    </svg>
);

const FannyPackSVG = ({ fill = "#1a1e2e" }) => (
    <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl neon-svg">
      <path fill={fill} stroke="rgba(126, 234, 255, 0.6)" strokeWidth="3" d="M433.2,167.3c-15.5-12.8-54.8-37.1-102.7-48.4c-20.9-4.9-46-7.9-74.5-7.9c-28.5,0-53.6,2.9-74.5,7.9 c-47.9,11.3-87.2,35.6-102.7,48.4c-9.6,8-14.8,19.6-14.8,32.2v64.6c0,53,43,96,96,96h192c53,0,96-43,96-96v-64.6 C448,186.9,442.8,175.2,433.2,167.3z M256,143c16.1,0,31.6,1.4,46.3,3.8c-14.5,4.7-29.8,7.2-46.3,7.2s-31.8-2.5-46.3-7.2 C224.4,144.4,239.9,143,256,143z M384,296.1c0,17.7-14.3,32-32,32H160c-17.7,0-32-14.3-32-32v-51.5c16.5-10.9,47.3-24.5,86.6-32 c13.4,4.2,27.3,6.4,41.4,6.4s28-2.2,41.4-6.4c39.3,7.5,70.1,21.1,86.6,32V296.1z"/>
      <path fill="rgba(0,0,0,0.3)" d="M504,184h-26.6c2.8-4.8,4.6-10.3,4.6-16.1v-8c0-17.7-14.3-32-32-32H62c-17.7,0-32,14.3-32,32v8 c0,5.9,1.8,11.3,4.6,16.1H8c-4.4,0-8,3.6-8,8v16c0,4.4,3.6,8,8,8h48v32c0,4.4,3.6,8,8,8h384c4.4,0,8-3.6,8-8v-32h48 c4.4,0,8-3.6,8-8v-16C512,187.6,508.4,184,504,184z"/>
    </svg>
);

// --- 3D Components ---

const FloatingGeom = () => {
   const groupRef = useRef<THREE.Group>(null);
   
   useFrame((state) => {
      if(groupRef.current) {
         groupRef.current.rotation.x = state.clock.elapsedTime * 0.2;
         groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      }
   });

   return (
      <group ref={groupRef} position={[3, 1, -2]} scale={0.5}>
         <mesh>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color="#00aeff" 
              wireframe 
              emissive="#00aeff"
              emissiveIntensity={0.5}
            />
         </mesh>
      </group>
   );
};

const ProductHologram = ({ 
  product, 
  children 
}: { 
  product: ProductType; 
  children?: React.ReactNode 
}) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* Glass Card Background - The "Three.js Example" aesthetic */}
        <mesh position={[0, 0, -0.05]}>
           <boxGeometry args={[5, 5, 0.1]} />
           <MeshTransmissionMaterial 
              backside
              samples={16}
              resolution={512}
              transmission={0.95}
              roughness={0.2}
              thickness={0.2}
              ior={1.5}
              chromaticAberration={0.06}
              anisotropy={0.1}
              distortion={0.1}
              distortionScale={0.3}
              temporalDistortion={0.5}
              clearcoat={1}
              attenuationDistance={0.5}
              attenuationColor="#ffffff"
              color="#e8f8ff"
              background={new THREE.Color('#000000')}
           />
        </mesh>

        {/* Outer Glow Ring */}
        <mesh position={[0,0,-0.1]}>
           <ringGeometry args={[2.5, 2.55, 64]} />
           <meshBasicMaterial color="#00aeff" toneMapped={false} />
        </mesh>

        <Html 
          transform 
          occlude="blending"
          position={[0, 0, 0.06]} // Slightly in front of glass
          scale={0.5} // Scale down to fit the args={[5,5]} box roughly (5 units / 0.5 scale = 10 units... actually HTML 1px = 1 unit at scale 1. 512px * 0.5 = 256 units... wait. THREE units. 512px / 100 roughly. 
          // Let's rely on visual fit.
          style={{
             width: '512px',
             height: '512px',
             // Transparent background so the glass shows through
             background: 'transparent', 
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             overflow: 'hidden',
             pointerEvents: 'none',
             userSelect: 'none'
          }}
        >
          <div className="w-full h-full relative">
             {/* Render the Product SVG Background */}
             <div className="absolute inset-0 opacity-90 p-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
               {product === 'tshirt' && <TshirtSVG />}
               {product === 'hoodie' && <HoodieSVG />}
               {product === 'sunglasses' && <SunglassesSVG />}
               {product === 'tote' && <ToteSVG />}
               {product === 'fannypack' && <FannyPackSVG />}
             </div>
             {/* Render the Design Elements Overlay */}
             {children}
          </div>
        </Html>
      </Float>
      
      {/* Decorative Floor Grid to anchor the scene */}
      <Grid 
        position={[0, -3, 0]} 
        args={[10, 10]} 
        cellColor="#1a2035" 
        sectionColor="#00aeff" 
        fadeDistance={20} 
        fadeStrength={1}
      />
    </group>
  );
}

const Scene3D = ({ 
  product, 
  elements, 
  previewImage,
  lowDpr,
  getPrintAreaStyle, 
  getElementStyle 
}: { 
  product: ProductType, 
  elements: DesignElement[],
  previewImage?: string | null,
  lowDpr?: boolean,
  getPrintAreaStyle: () => any,
  getElementStyle: (el: DesignElement, isSelected: boolean) => any
}) => {
   const deviceDpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
   const starCount = lowDpr ? 2000 : 5000;
   return (
      <div className="absolute inset-0 w-full h-full z-0">
         <Canvas
            dpr={lowDpr ? 1 : deviceDpr}
            camera={{ position: [0, 0, 8], fov: 35 }}
            gl={{ antialias: !lowDpr, alpha: true, powerPreference: lowDpr ? 'low-power' : 'high-performance' }}
         >
            <color attach="background" args={['#03040a']} />
            <fog attach="fog" args={['#03040a', 5, 25]} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            {/* Colorful accent lights for the glass refraction */}
            <pointLight position={[10, 10, 10]} intensity={2} color="#00aeff" />
            <pointLight position={[-10, -10, -5]} intensity={1.5} color="#ff62e5" />
            <rectAreaLight width={5} height={5} position={[0, 5, 0]} color="#ffffff" intensity={2} />
            
            <Stars radius={100} depth={50} count={starCount} factor={4} saturation={0} fade speed={1} />
            <FloatingGeom />
            
            {/* Environment Reflections */}
            <Environment preset="city" />

            <ProductHologram product={product}>
                {/* Re-using the logic from 2D view to render elements inside the 3D Hologram */}
                <div 
                  className="absolute z-10 w-full h-full"
                >
                  <div 
                    className="absolute"
                    style={{
                       ...getPrintAreaStyle(),
                       // The getPrintAreaStyle returns % based on parent. 
                       // Parent is the 512px box.
                       // No borders in 3D view
                    }}
                  >
                     {previewImage ? (
                        <img src={previewImage} alt="" className="w-full h-full object-contain" />
                     ) : (
                        elements.map(el => (
                           <div
                              key={el.id}
                              className="absolute"
                              style={{
                                 left: el.x,
                                 top: el.y,
                                 width: el.type === 'text' ? 'auto' : el.width,
                                 height: el.type === 'text' ? 'auto' : el.height,
                                 transform: el.texture !== 'puff' ? `rotate(${el.rotation}deg)` : undefined,
                                 opacity: el.opacity,
                              }}
                           >
                              {el.type === 'text' ? (
                                 <span style={getElementStyle(el, false)}>
                                    {el.content}
                                 </span>
                              ) : (
                                 <img src={el.content} alt="" className="w-full h-full object-contain" />
                              )}
                           </div>
                        ))
                     )}
                  </div>
                </div>
            </ProductHologram>

            <OrbitControls 
               enablePan={false} 
               minPolarAngle={Math.PI / 4} 
               maxPolarAngle={Math.PI / 1.5}
               minDistance={5}
               maxDistance={15}
               autoRotate
               autoRotateSpeed={0.8}
            />
         </Canvas>
      </div>
   );
}


// --- Main App Component ---

const App = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const isEmbed = queryParams.get('embed') === '1' || queryParams.get('embed') === 'true';
  const startPreview = isEmbed || queryParams.get('preview') === '1' || queryParams.get('preview') === 'true';
  const lowDprParam = queryParams.get('lowdpr') === '1' || queryParams.get('lowdpr') === 'true';
  const isMobile = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 768px)').matches || /Mobi|Android/i.test(navigator.userAgent)
    : false;
  const lowDpr = lowDprParam || (isEmbed && isMobile);

  const [product, setProduct] = useState<ProductType>('tshirt');
  const [elements, setElements] = useState<DesignElement[]>([
    { id: '1', type: 'text', x: 20, y: 50, width: 200, height: 40, rotation: 0, opacity: 1, content: 'NEON GENESIS', fontFamily: 'Orbitron', fontSize: 24, color: '#57f6ff', texture: 'glow', lockAspectRatio: true, strokeWidth: 0, shadowBlur: 0 }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(startPreview);
  const [isVtonOpen, setIsVtonOpen] = useState(false);
  const [vtonError, setVtonError] = useState<string | null>(null);
  const [isVtonLoading, setIsVtonLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  
  // Resizing State
  const [resizing, setResizing] = useState<{
    active: boolean;
    dir: string | null;
    startX: number;
    startY: number;
    startEl: DesignElement | null;
  }>({ active: false, dir: null, startX: 0, startY: 0, startEl: null });

  // Rotating State
  const [rotating, setRotating] = useState<{
     active: boolean;
     startAngle: number;
     startRotation: number;
     centerX: number;
     centerY: number;
     startEl: DesignElement | null;
  }>({ active: false, startAngle: 0, startRotation: 0, centerX: 0, centerY: 0, startEl: null });

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data: any = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'O4_DESIGN_PREVIEW') {
        const frontImage = data.payload?.frontImage || data.payload?.image || null;
        const backImage = data.payload?.backImage || null;
        setPreviewImages({
          front: frontImage ? String(frontImage) : null,
          back: backImage ? String(backImage) : null,
        });

        const nextSide = data.payload?.activeSide;
        if (nextSide === 'front' || nextSide === 'back') {
          setPreviewSide(nextSide);
        }

        const nextProduct = data.payload?.product;
        if (typeof nextProduct === 'string' && ['tshirt','hoodie','sunglasses','tote','fannypack'].includes(nextProduct)) {
          setProduct(nextProduct as ProductType);
        }
      }
      if (data.type === 'O4_CLEAR_PREVIEW') {
        setPreviewImages({ front: null, back: null });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- Logic Helpers ---
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const addTextElement = () => {
    const newEl: DesignElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'CYBER',
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      opacity: 1,
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Inter',
      texture: 'none',
      lockAspectRatio: true,
      strokeWidth: 0,
      strokeColor: '#000000',
      shadowBlur: 0,
      shadowColor: '#000000',
      shadowOffsetX: 0,
      shadowOffsetY: 0
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const loadPreset = (preset: Preset) => {
    if (window.confirm('Load preset? This will replace your current design.')) {
      const newElements = preset.elements.map((el, i) => ({
        ...el,
        id: crypto.randomUUID(),
        width: el.width || 100,
        height: el.height || 40,
        opacity: 1,
        lockAspectRatio: el.lockAspectRatio ?? true,
        strokeWidth: el.strokeWidth || 0,
        strokeColor: el.strokeColor || '#000000',
        shadowBlur: el.shadowBlur || 0,
        shadowColor: el.shadowColor || '#000000',
        shadowOffsetX: el.shadowOffsetX || 0,
        shadowOffsetY: el.shadowOffsetY || 0
      } as DesignElement));
      setElements(newElements);
      setSelectedId(null);
    }
  };

  const bringToFront = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1) return prev;
      const newEl = [...prev];
      const [item] = newEl.splice(idx, 1);
      newEl.push(item);
      return newEl;
    });
  };

  const sendToBack = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1) return prev;
      const newEl = [...prev];
      const [item] = newEl.splice(idx, 1);
      newEl.unshift(item);
      return newEl;
    });
  };

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedElement || !printAreaRef.current) return;
    
    // Get Print Area Dimensions
    const areaRect = printAreaRef.current.getBoundingClientRect();
    const areaWidth = areaRect.width;
    const areaHeight = areaRect.height;
    
    // Get Element Dimensions (from DOM for text accuracy)
    const domEl = document.getElementById(`element-${selectedElement.id}`);
    const elRect = domEl ? domEl.getBoundingClientRect() : { width: selectedElement.width, height: selectedElement.height };
    const width = elRect.width;
    const height = elRect.height;

    let updates: Partial<DesignElement> = {};

    switch(type) {
      case 'left': updates = { x: 0 }; break;
      case 'center': updates = { x: (areaWidth - width) / 2 }; break;
      case 'right': updates = { x: areaWidth - width }; break;
      case 'top': updates = { y: 0 }; break;
      case 'middle': updates = { y: (areaHeight - height) / 2 }; break;
      case 'bottom': updates = { y: areaHeight - height }; break;
    }
    
    updateElement(selectedElement.id, updates);
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  // --- Resize Logic ---
  const handleResizeStart = (e: React.MouseEvent, dir: string, el: DesignElement) => {
    e.stopPropagation();
    setResizing({
      active: true,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startEl: { ...el }
    });
  };
  
  // --- Rotate Logic ---
  const handleRotateStart = (e: React.MouseEvent, el: DesignElement) => {
     e.stopPropagation();
     const domEl = document.getElementById(`element-${el.id}`);
     if(!domEl) return;
     const rect = domEl.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     
     // Calculate initial angle
     const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
     
     setRotating({
        active: true,
        startAngle,
        startRotation: el.rotation,
        centerX,
        centerY,
        startEl: {...el}
     });
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      // Rotation Handling
      if(rotating.active && rotating.startEl) {
         const currentAngle = Math.atan2(e.clientY - rotating.centerY, e.clientX - rotating.centerX);
         let angleDiff = currentAngle - rotating.startAngle;
         
         // Convert radians to degrees
         let degDiff = angleDiff * (180 / Math.PI);
         let newRotation = rotating.startRotation + degDiff;
         
         // Optional: Snap to 45 degrees if Shift is held (can add logic here)
         // Normalize to -180 to 180 for cleaner UI values
         newRotation = newRotation % 360;
         
         updateElement(rotating.startEl.id, { rotation: newRotation });
         return;
      }

      // Resize Handling
      if (!resizing.active || !resizing.startEl) return;
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      const el = resizing.startEl;
      let updates: Partial<DesignElement> = {};

      // Check for Locked Aspect Ratio on Corners (ne, nw, se, sw)
      if (el.lockAspectRatio && ['nw', 'ne', 'sw', 'se'].includes(resizing.dir || '')) {
          const ratio = el.width / el.height;
          
          const isWest = resizing.dir?.includes('w');
          const isNorth = resizing.dir?.includes('n');
          const signX = isWest ? -1 : 1;
          const signY = isNorth ? -1 : 1;

          // Target dimensions based on mouse move
          const targetW = Math.max(20, el.width + (dx * signX));
          const targetH = Math.max(20, el.height + (dy * signY));

          // Project (w, h) onto line w = ratio * h
          // formula: h = (ratio * w_t + h_t) / (ratio^2 + 1)
          let newH = (ratio * targetW + targetH) / (ratio * ratio + 1);
          let newW = newH * ratio;
          
          // Min size check
          if (newW < 20 || newH < 20) {
             newH = Math.max(20, newH);
             newW = Math.max(20, newW);
             if (newW < 20) { newW = 20; newH = 20 / ratio; }
          }

          updates.width = newW;
          updates.height = newH;
          
          if (isWest) {
              updates.x = el.x + (el.width - newW);
          }
          if (isNorth) {
              updates.y = el.y + (el.height - newH);
          }
      } else {
        // Independent (Edge resizing or Unlocked Corner)
        if (dirIncludes(resizing.dir, 'e')) updates.width = Math.max(20, el.width + dx);
        if (dirIncludes(resizing.dir, 's')) updates.height = Math.max(20, el.height + dy);
        if (dirIncludes(resizing.dir, 'w')) {
          updates.x = el.x + dx;
          updates.width = Math.max(20, el.width - dx);
        }
        if (dirIncludes(resizing.dir, 'n')) {
          updates.y = el.y + dy;
          updates.height = Math.max(20, el.height - dy);
        }
      }

      updateElement(el.id, updates);
    };

    const handleGlobalUp = () => {
      if (resizing.active) {
        setResizing({ active: false, dir: null, startX: 0, startY: 0, startEl: null });
      }
      if (rotating.active) {
         setRotating({ active: false, startAngle: 0, startRotation: 0, centerX: 0, centerY: 0, startEl: null });
      }
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [resizing, rotating]);

  const dirIncludes = (dir: string | null, char: string) => dir && dir.includes(char);

  // --- Drag Logic ---
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (isPreview) return;
    // Don't drag if we clicked a handle
    if ((e.target as HTMLElement).classList.contains('handle-control')) return;

    e.stopPropagation();
    setSelectedId(id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const el = elements.find(x => x.id === id);
    if (!el) return;
    const initialX = el.x;
    const initialY = el.y;

    const onMove = (mv: MouseEvent) => {
      updateElement(id, {
        x: initialX + (mv.clientX - startX),
        y: initialY + (mv.clientY - startY)
      });
    };
    
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // --- Style Generation for Textures ---
  const getElementStyle = (el: DesignElement, isSelected: boolean): React.CSSProperties => {
    const baseStyle: any = { // Use any to allow custom properties
      fontSize: el.fontSize,
      color: el.color,
      fontFamily: el.fontFamily,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    };
    
    // Outline Logic
    if (el.strokeWidth && el.strokeWidth > 0) {
        baseStyle.WebkitTextStroke = `${el.strokeWidth}px ${el.strokeColor || '#000'}`;
    }

    // Shadow Logic - Composite Array
    let shadows: string[] = [];

    // Custom Drop Shadow
    if (el.shadowBlur !== undefined && (el.shadowBlur > 0 || el.shadowOffsetX !== 0 || el.shadowOffsetY !== 0)) {
        shadows.push(`${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || '#000'}`);
    }

    if (el.type === 'text') {
      switch (el.texture) {
        case 'glow':
          if (isSelected) {
            // Animated, dynamic glow for selected elements
            baseStyle['--glow-color'] = el.color;
            baseStyle.animation = 'neon-pulse 1.5s ease-in-out infinite alternate';
            baseStyle.color = '#fff';
            // Note: The animation handles the shadow, but we can append to it if we were careful.
            // For now, simpler to let animation win or push a static shadow if desired.
            // The static shadow below is for fallback/initial state
            shadows.push(`0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${el.color}, 0 0 30px ${el.color}`);
          } else {
            // Static, simpler glow for unselected
            shadows.push(`0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${el.color}, 0 0 30px ${el.color}`);
            baseStyle.color = '#fff'; 
          }
          break;
        case 'puff':
          shadows.push('2px 2px 0px rgba(0,0,0,0.3), 3px 3px 5px rgba(0,0,0,0.2)');
          baseStyle.transform = `rotate(${el.rotation}deg) scale(1.05)`; // Slight pop
          break;
        case 'vinyl':
          baseStyle.filter = 'brightness(1.2) contrast(1.1) drop-shadow(1px 1px 1px rgba(0,0,0,0.5))';
          break;
        case 'metallic':
          // For metallic, we override color with a gradient and use background clip
          baseStyle.background = `linear-gradient(135deg, ${el.color} 0%, #ffffff 40%, ${el.color} 60%, #555 100%)`;
          baseStyle.backgroundClip = 'text';
          baseStyle.color = 'transparent';
          baseStyle.WebkitBackgroundClip = 'text';
          baseStyle.WebkitTextFillColor = 'transparent';
          baseStyle.filter = 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))';
          break;
        case 'none':
        default:
          // Flat
          break;
      }
    }
    
    // Apply combined shadows
    if (shadows.length > 0) {
        // If animation is active (glow selected), it overrides textShadow in CSS keyframes.
        // We set it here for static states or non-animated textures.
        baseStyle.textShadow = shadows.join(', ');
    }

    return baseStyle;
  };

  // --- VTON Logic (MediaPipe Pose + Face) ---
  useEffect(() => {
    let isMounted = true;
    let stream: MediaStream | null = null;
    let animationId: number;
    let faceLandmarker: any;
    let poseLandmarker: any;

    if (isVtonOpen && videoRef.current) {
      setVtonError(null); // Reset error state on open
      setIsVtonLoading(true);

      const initVton = async () => {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
          );
          if (!isMounted) return;

          // Initialize with explicit delegate handling to prevent crashes
          // Note: "Created TensorFlow Lite XNNPACK delegate for CPU" is an INFO log, not an error.
          // It means fallback happened, which is fine, but we ensure code continues.
          try {
             faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                  delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
             });
             
             poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
               baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
                  delegate: "GPU"
               },
               runningMode: "VIDEO",
               numPoses: 1
             });
          } catch (gpuError) {
             // Fallback to CPU is expected on many devices. The log generated here is suppressed above.
             if (!isMounted) return;
             
             faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                  delegate: "CPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
             });
             poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
               baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
                  delegate: "CPU"
               },
               runningMode: "VIDEO",
               numPoses: 1
             });
          }

          if (!isMounted) return;

          // Robust Camera Access
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
             throw new Error("Camera API not supported on this browser.");
          }

          try {
             // Try specific facing mode first (mobiles)
             stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                   facingMode: "user",
                   width: { ideal: 1280 },
                   height: { ideal: 720 } 
                } 
             });
          } catch (e: any) {
             console.warn("User facing camera request failed:", e);
             
             // Specific error handling for initial failure
             if (e.name === 'NotAllowedError') {
                 setVtonError("Camera access was denied. Please allow camera permissions in your browser settings.");
                 setIsVtonLoading(false);
                 return;
             }
             if (e.name === 'NotFoundError') {
                 setVtonError("No camera found on this device.");
                 setIsVtonLoading(false);
                 return;
             }
             
             try {
                // Fallback to any video device (desktops)
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
             } catch (e2: any) {
                console.error("Fallback camera failed:", e2);
                if (e2.name === 'NotAllowedError') {
                    setVtonError("Camera access was denied. Please allow camera permissions.");
                } else if (e2.name === 'NotFoundError') {
                    setVtonError("No camera available.");
                } else {
                    setVtonError("Could not start camera. " + (e2.message || "Unknown error."));
                }
                setIsVtonLoading(false);
                return;
             }
          }

          if (isMounted && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            
            // Explicitly trigger play to prevent stalled state
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e));

            const startPrediction = () => {
               if(isMounted) {
                  setIsVtonLoading(false);
                  predictWebcam();
               }
            };
            
            // Robust check: if readyState is already enough, start immediately
            if (videoRef.current.readyState >= 2) {
                startPrediction();
            } else {
                videoRef.current.onloadeddata = startPrediction;
            }
          } else if (stream) {
             // If unmounted during init, stop immediately
             stream.getTracks().forEach(t => t.stop());
          }

        } catch (err: any) {
          console.error("VTON Init Error:", err);
          if (isMounted) {
             setVtonError(err.message || "Failed to initialize Virtual Try-On.");
             setIsVtonLoading(false);
          }
        }
      };

      const predictWebcam = async () => {
        if (!videoRef.current || !isMounted || !overlayRef.current) return;
        
        // Ensure video is actually playing and has dimensions
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0 && !videoRef.current.paused) {
            let startTimeMs = performance.now();
            
            // Determine tracking mode based on product
            const needsPose = ['tshirt', 'hoodie', 'tote', 'fannypack'].includes(product);
            const needsFace = product === 'sunglasses';

            // Calculations
            let finalX = 0, finalY = 0, finalScale = 1, finalRot = 0;
            let found = false;
            
            // Get Dimensions
            const rect = videoRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Mirror Helper: Flip X coordinates because video is mirrored
            // n is normalized [0,1]. If video is mirrored, 0 (left of frame) -> 1 (right of screen)
            const toPxX = (n: number) => (1 - n) * width;
            const toPxY = (n: number) => n * height;

            // 1. POSE TRACKING
            if (needsPose && poseLandmarker) {
               const poseResult = poseLandmarker.detectForVideo(videoRef.current, startTimeMs);
               if (poseResult.landmarks && poseResult.landmarks.length > 0) {
                  const lm = poseResult.landmarks[0];
                  // Landmarks: 11(L.Shoulder), 12(R.Shoulder), 23(L.Hip), 24(R.Hip)
                  const ls = lm[11];
                  const rs = lm[12];
                  const lh = lm[23];
                  const rh = lm[24];

                  // Ensure we have decent confidence landmarks (basic check if they exist)
                  if (ls && rs && lh && rh) {
                     found = true;
                     
                     // Torso Center
                     const cx = (ls.x + rs.x + lh.x + rh.x) / 4;
                     const cy = (ls.y + rs.y + lh.y + rh.y) / 4;

                     // Shoulder Width (for scale)
                     const shoulderWidth = Math.sqrt(Math.pow(rs.x - ls.x, 2) + Math.pow(rs.y - ls.y, 2));
                     
                     const rawDx = rs.x - ls.x;
                     const dy = rs.y - ls.y;
                     const slope = Math.atan2(dy, -rawDx); // Mirrored slope

                     if (product === 'tote') {
                        finalX = toPxX(ls.x) - (shoulderWidth * width * 0.2); 
                        finalY = toPxY(ls.y) + (shoulderWidth * width * 0.8); 
                        finalScale = (shoulderWidth * width) / 100;
                        finalRot = slope * (180 / Math.PI);
                     } else if (product === 'fannypack') {
                        const hipCx = (lh.x + rh.x) / 2;
                        const hipCy = (lh.y + rh.y) / 2;
                        finalX = toPxX(hipCx);
                        finalY = toPxY(hipCy);
                        finalScale = (shoulderWidth * width) / 120;
                        finalRot = slope * (180 / Math.PI);
                     } else {
                        // Shirt/Hoodie
                        finalX = toPxX(cx);
                        finalY = toPxY(cy) - (shoulderWidth * width * 0.2); 
                        finalScale = (shoulderWidth * width) / 130;
                        finalRot = slope * (180 / Math.PI);
                     }
                  }
               }
            } 
            
            // 2. FACE TRACKING (Used for Sunglasses OR Fallback for Body items)
            // If pose failed but we need shirt/hoodie, try face as fallback
            const useFaceFallback = needsPose && !found;

            if ((needsFace || useFaceFallback) && faceLandmarker) {
               const faceResult = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
               if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
                  const lm = faceResult.faceLandmarks[0];
                  // 33(L Eye Inner), 263(R Eye Inner), 152(Chin), 1(Nose Tip)
                  const le = lm[33];
                  const re = lm[263];
                  const chin = lm[152];
                  
                  if (le && re && chin) {
                     // Eye Distance
                     const dist = Math.sqrt(Math.pow(re.x - le.x, 2) + Math.pow(re.y - le.y, 2));
                     const rawDx = re.x - le.x;
                     const dy = re.y - le.y;
                     const angle = Math.atan2(dy, -rawDx);

                     if (needsFace) {
                         // Sunglasses
                         found = true;
                         const cx = (le.x + re.x) / 2;
                         const cy = (le.y + re.y) / 2;
                         finalX = toPxX(cx);
                         finalY = toPxY(cy);
                         finalScale = (dist * width) / 60; // 60 is ref
                         finalRot = angle * (180 / Math.PI);
                     } else if (useFaceFallback) {
                         // Shirt/Hoodie Fallback (Anchor to Chin + offset)
                         found = true;
                         const chinX = chin.x;
                         const chinY = chin.y;
                         
                         finalX = toPxX(chinX);
                         // Estimate torso center below chin
                         // One head height ~ 2x eye-chin dist roughly
                         // We place it down by some factor of eye dist
                         finalY = toPxY(chinY) + (dist * width * 3.5); 
                         finalScale = (dist * width * 5) / 130; // Estimate shoulder width from eye width
                         finalRot = angle * (180 / Math.PI);
                     }
                  }
               }
            }

            if (found) {
               overlayRef.current.style.transform = `translate(${finalX}px, ${finalY}px) translate(-50%, -50%) rotate(${finalRot}deg) scale(${finalScale})`;
               overlayRef.current.style.opacity = '1';
               if (guideRef.current) guideRef.current.style.borderColor = "#72ff9a";
            } else {
               if (guideRef.current) guideRef.current.style.borderColor = "rgba(0, 255, 255, 0.3)";
               // Fade out if tracking lost
               overlayRef.current.style.opacity = '0.2';
            }
        }
        
        animationId = requestAnimationFrame(predictWebcam);
      };

      initVton();
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
         const s = videoRef.current.srcObject as MediaStream;
         s.getTracks().forEach(t => t.stop());
         videoRef.current.srcObject = null;
      }
      if (animationId) cancelAnimationFrame(animationId);
      if (faceLandmarker) faceLandmarker.close();
      if (poseLandmarker) poseLandmarker.close();
    };
  }, [isVtonOpen, product]);

  // --- Render Assets ---
  const getProductSVG = () => {
    switch(product) {
      case 'tshirt': return <TshirtSVG />;
      case 'hoodie': return <HoodieSVG />;
      case 'sunglasses': return <SunglassesSVG />;
      case 'tote': return <ToteSVG />;
      case 'fannypack': return <FannyPackSVG />;
      default: return <TshirtSVG />;
    }
  };

  const getPrintAreaStyle = () => {
    switch(product) {
      case 'tshirt': return { top: '22%', left: '28%', width: '44%', height: '55%' };
      case 'hoodie': return { top: '25%', left: '28%', width: '44%', height: '45%' };
      case 'sunglasses': return { top: '40%', left: '15%', width: '70%', height: '20%' }; // Across both lenses/frame
      case 'tote': return { top: '35%', left: '25%', width: '50%', height: '45%' };
      case 'fannypack': return { top: '35%', left: '30%', width: '40%', height: '30%' };
      default: return { top: '20%', left: '30%', width: '40%', height: '50%' };
    }
  };

  return (
    <div id="teleporter-hub" onClick={() => setSelectedId(null)}>
      {/* --- VTON Modal --- */}
      {isVtonOpen && (
        <div className="vton-modal">
          <div className="vton-container" onClick={(e) => e.stopPropagation()}>
            <button className="vton-close" onClick={() => setIsVtonOpen(false)}><X size={20}/></button>
            <div className="vton-stage">
              {vtonError ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-900 text-white">
                    <AlertCircle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                    <p className="text-gray-300 max-w-md">{vtonError}</p>
                    <button 
                       onClick={() => setIsVtonOpen(false)}
                       className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600"
                    >
                       Close
                    </button>
                 </div>
              ) : isVtonLoading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white">
                    <Loader2 size={48} className="animate-spin text-[#00aeff] mb-4" />
                    <div className="text-lg font-bold">Initializing Vision Models...</div>
                    <div className="text-sm text-gray-400 mt-2">First load may take a moment</div>
                 </div>
              ) : (
                <>
                  <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted
                     style={{ transform: 'scaleX(-1)' }} // Mirror the local webcam
                  ></video>
                  <div ref={guideRef} className="vton-guide"></div>
                  
                  {/* VTON Overlay - Dynamic positioning */}
                  <div 
                     ref={overlayRef}
                     className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none origin-center transition-opacity duration-200"
                     style={{ opacity: 0 }}
                  >
                      {/* Container that holds the SVG and the Elements */}
                      <div className="relative w-full h-full">
                         {/* Base Product SVG (Optional in VTON? Maybe faint) */}
                         <div className="absolute inset-0 opacity-80 drop-shadow-2xl">
                            {getProductSVG()}
                         </div>
                         
                         {/* Design Elements Rendered on Top */}
                         <div className="absolute inset-0">
                             {/* Map overlay elements using percentages similar to canvas */}
                             <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                {/* We map the print area relative to the VTON Overlay Box size (300x300) */}
                                {/* Note: In VTON we render the 'result', so we map the print area box first */}
                                <div className="absolute" style={getPrintAreaStyle()}>
                                   {elements.map(el => {
                                      // Scale elements from the editor (which might be arbitrary px) to this preview
                                      // Simplified: Just render them as is, assuming similar container ratio
                                      return (
                                         <div
                                           key={el.id}
                                           className="absolute"
                                           style={{
                                              left: el.x,
                                              top: el.y,
                                              // Note: In a real app we'd scale these x/y values if the container sizes differ significantly
                                              // For now assuming 1:1 mapping with editor canvas
                                              transform: el.texture !== 'puff' ? `rotate(${el.rotation}deg)` : undefined,
                                              opacity: el.opacity,
                                           }}
                                         >
                                            <span style={getElementStyle(el, false)}>{el.content}</span>
                                         </div>
                                      )
                                   })}
                                </div>
                             </div>
                         </div>
                      </div>
                  </div>
                </>
              )}
            </div>
            {!vtonError && !isVtonLoading && (
              <div className="vton-controls">
                 <p className="text-white/70 text-sm">
                   {product === 'sunglasses' && "Align eyes with guide."}
                   {product === 'tote' && "Shows on your left shoulder."}
                   {product === 'fannypack' && "Shows at waist level."}
                   {(product === 'tshirt' || product === 'hoodie') && "Stand back to show shoulders."}
                 </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Header --- */}
      {/* Hide Header in Preview Mode for full immersion, or keep simplified. Let's keep simplified overlay. */}
      {!isPreview && !isEmbed && (
        <div className="neo-shell">
          <header className="neo-header">
            <div className="neo-breadcrumb">
              <span>Shop</span> <span className="mx-2 opacity-50">/</span> <span className="text-[#00aeff]">Customizer</span>
            </div>

            <div className="neo-actions">
              <button className="neo-icon-btn" onClick={(e) => { e.stopPropagation(); setIsPreview(true); setSelectedId(null); }} title="Preview Mode">
                <Eye size={18} />
              </button>
              <button className="neo-icon-btn" title="Search"><Search size={18} /></button>
              <button className="neo-icon-btn" title="Cart"><ShoppingBag size={18} /></button>
            </div>
          </header>
        </div>
      )}

      {/* --- Preview Mode Exit Button --- */}
      {isPreview && !isEmbed && (
         <div className="fixed top-6 right-6 z-50 animate-fade-in">
            <button 
              onClick={() => setIsPreview(false)}
              className="bg-black/60 backdrop-blur-md border border-[#00aeff] text-[#00aeff] px-6 py-3 rounded-full flex items-center gap-2 font-bold uppercase tracking-widest hover:bg-[#00aeff]/20 transition-all shadow-[0_0_20px_rgba(0,174,255,0.3)]"
            >
               <EyeOff size={18} /> Exit Preview
            </button>
         </div>
      )}

      {/* --- Main Grid --- */}
      <div className={`neo-shell ${isPreview ? '!pt-12' : ''}`}>
        <div className={`neo-grid ${isPreview ? '!grid-cols-1 !gap-0 max-w-4xl mx-auto' : ''}`}>
          
          {/* Canvas */}
          <div className={`gallery-card ${isPreview ? 'h-[85vh] !p-0 overflow-hidden' : ''}`}>
            
            {!isPreview && (
              <div className="product-title">
                <span className="uppercase">{product}</span>
              </div>
            )}

            {isPreview ? (
               /* --- 3D Preview (Replaces Canvas in Preview Mode) --- */
               <Scene3D 
                  product={product} 
                  elements={elements}
                  previewImage={previewImages[previewSide] || null}
                  lowDpr={lowDpr}
                  getPrintAreaStyle={getPrintAreaStyle}
                  getElementStyle={getElementStyle}
               />
            ) : (
               /* --- 2D Editor Canvas --- */
               <div 
                  className="hero-frame" 
                  ref={heroRef}
               >
                  {/* Only show grid in edit mode */}
                  <div 
                     className={`relative w-full h-full flex items-center justify-center canvas-grid min-h-[500px]`} 
                     ref={canvasRef}
                  >
                     
                     {/* Product Base */}
                     <div className={`w-[80%] h-[80%] z-0 pointer-events-none opacity-90 drop-shadow-2xl transition-all duration-500`}>
                        {getProductSVG()}
                     </div>

                     {/* Print Area */}
                     <div 
                        className={`absolute z-10 transition-all duration-300 border border-dashed border-[#00aeff]/30 bg-[#00aeff]/5`}
                        style={getPrintAreaStyle()}
                        ref={printAreaRef}
                        onClick={(e) => {
                           // If clicking empty space in print area, deselect
                           if(e.target === e.currentTarget) setSelectedId(null);
                        }}
                     >
                        {elements.map(el => {
                           const isSelected = selectedId === el.id;
                           return (
                           <div
                              id={`element-${el.id}`}
                              key={el.id}
                              onMouseDown={(e) => handleDragStart(e, el.id)}
                              className={`absolute group hover:ring-1 hover:ring-white/30 cursor-move`}
                              style={{
                                 left: el.x,
                                 top: el.y,
                                 width: el.type === 'text' ? 'auto' : el.width,
                                 height: el.type === 'text' ? 'auto' : el.height,
                                 transform: el.texture !== 'puff' ? `rotate(${el.rotation}deg)` : undefined, // Puff applies its own transform
                                 opacity: el.opacity,
                                 border: isSelected ? '1px dashed #00aeff' : 'none',
                              }}
                           >
                              {el.type === 'text' ? (
                                 <span style={getElementStyle(el, isSelected)}>
                                 {el.content}
                                 </span>
                              ) : (
                                 <img src={el.content} className="w-full h-full object-contain pointer-events-none" />
                              )}

                              {/* Handles (Only when selected) */}
                              {isSelected && (
                                 <>
                                    {/* Rotation Handle */}
                                    <div 
                                       className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing handle-control"
                                       onMouseDown={(e) => handleRotateStart(e, el)}
                                    >
                                       <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_10px_#00aeff] border border-[#00aeff]">
                                          <RotateCw size={14} />
                                       </div>
                                       <div className="w-0.5 h-4 bg-[#00aeff]"></div>
                                    </div>
                                    
                                    {/* Corners */}
                                    <div onMouseDown={(e) => handleResizeStart(e, 'nw', el)} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#00aeff] cursor-nw-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 'ne', el)} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#00aeff] cursor-ne-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 'sw', el)} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#00aeff] cursor-sw-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 'se', el)} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#00aeff] cursor-se-resize z-50 rounded-full handle-control"></div>
                                    {/* Edges */}
                                    <div onMouseDown={(e) => handleResizeStart(e, 'n', el)} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-[#00aeff] cursor-ns-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 's', el)} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-[#00aeff] cursor-ns-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 'w', el)} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-1.5 h-4 bg-white border border-[#00aeff] cursor-ew-resize z-50 rounded-full handle-control"></div>
                                    <div onMouseDown={(e) => handleResizeStart(e, 'e', el)} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-1.5 h-4 bg-white border border-[#00aeff] cursor-ew-resize z-50 rounded-full handle-control"></div>
                                 </>
                              )}
                           </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}
            
            {!isPreview && (
              <div className="mt-4 flex justify-between items-center text-xs tracking-widest text-[#9fb6d8]">
                <button onClick={() => setElements([])} className="hover:text-white flex items-center gap-1"><RotateCcw size={12}/> RESET DESIGN</button>
                <div>{elements.length} LAYERS</div>
              </div>
            )}
          </div>

          {/* Sidebar - Hidden in Preview Mode */}
          {!isPreview && (
            <div className="options-panel animate-fade-in-right">
              {/* Product Select */}
              <div className="option-block">
                <div className="option-title">Base Unit</div>
                <div className="size-pills">
                  <button className={`pill ${product === 'tshirt' ? 'active' : ''}`} onClick={() => setProduct('tshirt')} title="T-Shirt"><Shirt size={14}/></button>
                  <button className={`pill ${product === 'hoodie' ? 'active' : ''}`} onClick={() => setProduct('hoodie')} title="Hoodie"><Layers size={14}/></button>
                  <button className={`pill ${product === 'sunglasses' ? 'active' : ''}`} onClick={() => setProduct('sunglasses')} title="Sunglasses"><Glasses size={14}/></button>
                  <button className={`pill ${product === 'tote' ? 'active' : ''}`} onClick={() => setProduct('tote')} title="Tote Bag"><ShoppingBag size={14}/></button>
                  <button className={`pill ${product === 'fannypack' ? 'active' : ''}`} onClick={() => setProduct('fannypack')} title="Fanny Pack"><Briefcase size={14}/></button>
                </div>
              </div>

               {/* Design Templates / Presets */}
               <div className="option-block">
                <div className="option-title flex items-center gap-2"><LayoutTemplate size={12}/> Design Templates</div>
                <div className="grid grid-cols-2 gap-2">
                   {PRESETS.map((preset, i) => (
                      <button 
                        key={i}
                        onClick={() => loadPreset(preset)}
                        className="bg-white/5 border border-white/10 hover:border-[#00aeff] hover:bg-[#00aeff]/10 p-2 rounded text-left transition-all"
                      >
                         <div className="text-[10px] uppercase font-bold text-gray-300">{preset.name}</div>
                         <div className="text-[8px] text-gray-500">{preset.elements.length} Elements</div>
                      </button>
                   ))}
                </div>
              </div>

              {/* Toolkit & Live Preview moved up for visibility */}
              <div className="option-block border-l-2 border-l-[#ff62e5]">
                 <div className="option-title text-[#ff62e5]">Toolkit</div>
                 <button onClick={addTextElement} className="w-full py-3 mb-2 bg-[#ff62e5]/10 border border-[#ff62e5]/30 rounded text-[#ff62e5] hover:bg-[#ff62e5]/20 flex items-center justify-center gap-2 font-bold text-xs tracking-wider">
                    <Type size={16} /> ADD TEXT
                 </button>
                 {/* VTON Button relocated here for better visibility */}
                 <button 
                    onClick={() => setIsVtonOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2 mt-2"
                  >
                    <Camera size={18} /> LIVE PREVIEW
                  </button>
              </div>

              {/* Properties */}
              {selectedElement ? (
                <div className="option-block border-l-2 border-l-[#00aeff]">
                  <div className="flex justify-between items-center mb-2">
                     <div className="option-title text-[#00aeff] mb-0">Properties</div>
                     <button onClick={() => deleteElement(selectedElement.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                  </div>

                  {/* Alignment Tools */}
                  <div className="mb-4">
                     <div className="text-[10px] text-gray-500 uppercase mb-2">Alignment</div>
                     <div className="grid grid-cols-3 gap-2 mb-2">
                        <button onClick={() => handleAlign('left')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Left"><AlignLeft size={14}/></button>
                        <button onClick={() => handleAlign('center')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Center"><AlignCenter size={14}/></button>
                        <button onClick={() => handleAlign('right')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Right"><AlignRight size={14}/></button>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleAlign('top')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Top"><ArrowUpToLine size={14}/></button>
                        <button onClick={() => handleAlign('middle')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Middle"><div className="rotate-90"><AlignCenter size={14}/></div></button>
                        <button onClick={() => handleAlign('bottom')} className="p-2 bg-white/5 rounded hover:bg-white/10 flex justify-center border border-transparent hover:border-[#00aeff]/30 transition-all" title="Align Bottom"><ArrowDownToLine size={14}/></button>
                     </div>
                  </div>

                  {selectedElement.type === 'text' && (
                    <div className="space-y-4">
                      <input 
                         type="text" 
                         className="neo-input"
                         value={selectedElement.content}
                         onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      />
                      
                      {/* Font Selection Box */}
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase mb-2">Typography</div>
                        <div className="grid grid-cols-2 gap-2 h-32 overflow-y-auto pr-1 custom-scrollbar">
                           {FONT_OPTIONS.map(font => (
                             <button
                               key={font.name}
                               className={`p-2 text-center rounded border transition-all ${selectedElement.fontFamily === font.name ? 'border-[#00aeff] bg-[#00aeff]/10 text-[#00aeff]' : 'border-white/10 hover:border-white/30 bg-black/20 text-gray-400'}`}
                               style={{ fontFamily: font.name }}
                               onClick={() => updateElement(selectedElement.id, { fontFamily: font.name })}
                             >
                               <span className="text-sm block">{font.name}</span>
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* Texture Selection */}
                      <div>
                         <div className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-2"><Layers size={10} /> Texture / Finish</div>
                         <div className="grid grid-cols-2 gap-2">
                            {TEXTURE_OPTIONS.map(tex => (
                              <button
                                key={tex.id}
                                onClick={() => updateElement(selectedElement.id, { texture: tex.id })}
                                className={`text-left px-3 py-2 rounded border text-xs transition-all relative overflow-hidden ${selectedElement.texture === tex.id ? 'border-[#ff62e5] bg-[#ff62e5]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                              >
                                <div className="font-bold">{tex.label}</div>
                                <div className="text-[9px] opacity-70">{tex.description}</div>
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Effects Section */}
                      <div className="border-t border-white/10 pt-4">
                         <div className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-2"><Sparkles size={10} /> Effects</div>
                         
                         {/* Outline */}
                         <div className="mb-3">
                            <div className="flex justify-between items-center text-[9px] text-gray-400 mb-1">
                               <span>OUTLINE</span>
                               <span>{selectedElement.strokeWidth}px</span>
                            </div>
                            <div className="flex gap-2 items-center">
                               <input 
                                  type="range" min="0" max="10" step="0.5"
                                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                                  value={selectedElement.strokeWidth || 0}
                                  onChange={(e) => updateElement(selectedElement.id, { strokeWidth: parseFloat(e.target.value) })}
                               />
                               <input 
                                 type="color" 
                                 value={selectedElement.strokeColor || '#000000'}
                                 onChange={(e) => updateElement(selectedElement.id, { strokeColor: e.target.value })}
                                 className="bg-transparent border-0 w-6 h-6 p-0 cursor-pointer"
                                 title="Outline Color"
                              />
                            </div>
                         </div>

                         {/* Shadow */}
                         <div className="mb-1">
                            <div className="flex justify-between items-center text-[9px] text-gray-400 mb-1">
                               <span>SHADOW (Blur / X / Y)</span>
                               <input 
                                 type="color" 
                                 value={selectedElement.shadowColor || '#000000'}
                                 onChange={(e) => updateElement(selectedElement.id, { shadowColor: e.target.value })}
                                 className="bg-transparent border-0 w-4 h-4 p-0 cursor-pointer"
                                 title="Shadow Color"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                               <input 
                                  type="range" min="0" max="30"
                                  className="h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                                  value={selectedElement.shadowBlur || 0}
                                  onChange={(e) => updateElement(selectedElement.id, { shadowBlur: parseInt(e.target.value) })}
                                  title="Blur Radius"
                               />
                               <input 
                                  type="range" min="-20" max="20"
                                  className="h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                                  value={selectedElement.shadowOffsetX || 0}
                                  onChange={(e) => updateElement(selectedElement.id, { shadowOffsetX: parseInt(e.target.value) })}
                                  title="Offset X"
                               />
                               <input 
                                  type="range" min="-20" max="20"
                                  className="h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                                  value={selectedElement.shadowOffsetY || 0}
                                  onChange={(e) => updateElement(selectedElement.id, { shadowOffsetY: parseInt(e.target.value) })}
                                  title="Offset Y"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                          <span>Size & Ratio</span> 
                          <button 
                             onClick={() => updateElement(selectedElement.id, { lockAspectRatio: !selectedElement.lockAspectRatio })}
                             className={`p-1 rounded border transition-all ${selectedElement.lockAspectRatio ? 'border-[#00aeff] bg-[#00aeff]/20 text-[#00aeff]' : 'border-white/10 text-gray-400'}`}
                             title={selectedElement.lockAspectRatio ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                          >
                             {selectedElement.lockAspectRatio ? <Lock size={12}/> : <Unlock size={12}/>}
                          </button>
                        </div>
                        <input
                           type="range" min="12" max="100"
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                           value={selectedElement.fontSize}
                           onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        />
                      </div>

                      {/* Rotation Slider */}
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                          <span>Rotation</span>
                          <span className="text-[#00aeff]">{Math.round(selectedElement.rotation)}°</span>
                        </div>
                        <input
                           type="range" min="-180" max="180"
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00aeff]"
                           value={selectedElement.rotation}
                           onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase">Fill Color</span>
                        <input 
                           type="color" 
                           value={selectedElement.color}
                           onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                           className="bg-transparent border-0 w-8 h-8 p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                     <button onClick={() => bringToFront(selectedElement.id)} className="flex-1 py-2 bg-white/5 rounded text-[10px] hover:bg-white/10 flex items-center justify-center gap-1"><ArrowUpToLine size={12}/> Front</button>
                     <button onClick={() => sendToBack(selectedElement.id)} className="flex-1 py-2 bg-white/5 rounded text-[10px] hover:bg-white/10 flex items-center justify-center gap-1"><ArrowDownToLine size={12}/> Back</button>
                  </div>
                </div>
              ) : (
                <div className="option-block flex flex-col items-center justify-center py-8 text-gray-500 text-xs text-center border-dashed">
                  <Move size={24} className="mb-2 opacity-50"/>
                  Select an element to edit
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
