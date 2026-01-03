import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Type, Image as ImageIcon, Layers, Settings, ShoppingCart, 
  Menu, Undo, Redo, ZoomIn, ZoomOut, Download, Share2, 
  Monitor, Box, Glasses, Palette, Upload, MousePointer2,
  Trash2, Move, RotateCw, Sparkles, Shirt, Coffee, Lightbulb
} from 'lucide-react';
import * as THREE from 'https://esm.sh/three@0.160.0';

// Types
type DesignElement = {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  fontFamily?: string;
  fontSize?: number;
  effect?: 'none' | 'neon' | 'shadow';
  opacity: number;
};

type ProductType = 'tshirt' | 'mug' | 'neon';

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

// 3D Preview Component using Three.js
const ThreePreview = ({ productType, designElements }: { productType: ProductType, designElements: DesignElement[] }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Object Geometry based on product
    let geometry;
    let material;
    
    // Create a canvas texture from the design elements
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = productType === 'tshirt' ? '#ffffff' : productType === 'neon' ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      
      designElements.forEach(el => {
        ctx.save();
        ctx.translate(el.x / 2 + 256, el.y / 2 + 256); // Simplified mapping
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.globalAlpha = el.opacity;
        
        if (el.type === 'text') {
          ctx.font = `${el.fontSize || 24}px ${el.fontFamily || 'Arial'}`;
          ctx.fillStyle = el.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (el.effect === 'neon') {
             ctx.shadowColor = el.color;
             ctx.shadowBlur = 15;
          }
          ctx.fillText(el.content, 0, 0);
        } else if (el.type === 'shape') {
           ctx.fillStyle = el.color;
           ctx.fillRect(-el.width/4, -el.height/4, el.width/2, el.height/2);
        }
        ctx.restore();
      });
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    if (productType === 'tshirt') {
      // Simplified T-shirt shape (just a plane for now, usually needs a model loader)
      geometry = new THREE.PlaneGeometry(3, 4);
      material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    } else if (productType === 'mug') {
      geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
      material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
      // Neon sign
      geometry = new THREE.BoxGeometry(4, 2, 0.2);
      material = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x222222 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [productType, designElements]);

  return <div ref={mountRef} className="w-full h-full bg-neutral-900 rounded-lg overflow-hidden shadow-2xl" />;
};

// Main Application
const App = () => {
  // State
  const [elements, setElements] = useState<DesignElement[]>([
    { 
      id: '1', type: 'text', content: 'ONES4', x: 0, y: -50, width: 200, height: 50, 
      rotation: 0, color: '#00ffcc', fontFamily: 'Arial', fontSize: 48, effect: 'neon', opacity: 1 
    }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [activeTool, setActiveTool] = useState('text');
  const [product, setProduct] = useState<ProductType>('tshirt');
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'vr'>('2d');
  const [zoom, setZoom] = useState(100);

  // Computed
  const selectedElement = elements.find(el => el.id === selectedId);

  // Handlers
  const addText = () => {
    const newEl: DesignElement = {
      id: generateId(),
      type: 'text',
      content: 'New Text',
      x: 0,
      y: 0,
      width: 150,
      height: 40,
      rotation: 0,
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Inter',
      opacity: 1,
      effect: 'none'
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Dragging Logic (Simplified for prototype)
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setElements(elements.map(el => {
        if (el.id === selectedId) {
          return { ...el, x: el.x + dx, y: el.y + dy };
        }
        return el;
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] text-white font-sans overflow-hidden" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      
      {/* Header */}
      <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center font-bold">O4</div>
          <h1 className="font-bold text-lg tracking-tight">ONES4 Print Designer</h1>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('2d')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === '2d' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4 inline mr-2"/>
            Design
          </button>
          <button 
            onClick={() => setViewMode('3d')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === '3d' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <Box className="w-4 h-4 inline mr-2"/>
            3D Preview
          </button>
          <button 
            onClick={() => setViewMode('vr')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'vr' ? 'bg-purple-900/50 text-purple-400' : 'text-neutral-400 hover:text-purple-400'}`}
          >
            <Glasses className="w-4 h-4 inline mr-2"/>
            Try Oonj VR
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400"><Undo className="w-5 h-5"/></button>
          <button className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400"><Redo className="w-5 h-5"/></button>
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-20 bg-[#0a0a0a] border-r border-neutral-800 flex flex-col items-center py-4 gap-6">
          <ToolButton icon={Type} label="Text" active={activeTool === 'text'} onClick={() => setActiveTool('text')} />
          <ToolButton icon={ImageIcon} label="Photos" active={activeTool === 'images'} onClick={() => setActiveTool('images')} />
          <ToolButton icon={Sparkles} label="Neon" active={activeTool === 'neon'} onClick={() => setActiveTool('neon')} />
          <ToolButton icon={Layers} label="Layers" active={activeTool === 'layers'} onClick={() => setActiveTool('layers')} />
          <ToolButton icon={Settings} label="Settings" active={activeTool === 'settings'} onClick={() => setActiveTool('settings')} />
        </aside>

        {/* Extended Left Sidebar (Contextual) */}
        <div className="w-64 bg-[#121212] border-r border-neutral-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {activeTool === 'text' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-200">Typography</h3>
              <button onClick={addText} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-sm">
                + Add Heading
              </button>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Font Styles</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-neutral-900 rounded flex items-center justify-center font-serif text-xl border border-neutral-800 cursor-pointer hover:border-cyan-500">Serif</div>
                  <div className="h-16 bg-neutral-900 rounded flex items-center justify-center font-sans text-xl border border-neutral-800 cursor-pointer hover:border-cyan-500">Sans</div>
                  <div className="h-16 bg-neutral-900 rounded flex items-center justify-center font-mono text-xl border border-neutral-800 cursor-pointer hover:border-cyan-500">Mono</div>
                  <div className="h-16 bg-neutral-900 rounded flex items-center justify-center italic text-xl border border-neutral-800 cursor-pointer hover:border-cyan-500" style={{fontFamily: 'cursive'}}>Hand</div>
                </div>
              </div>
            </div>
          )}
           {activeTool === 'neon' && (
             <div className="space-y-4">
               <h3 className="font-semibold text-neutral-200">Neon Effects</h3>
               <p className="text-sm text-neutral-400">Apply glowing effects to your text to create realistic neon signs.</p>
               <button 
                onClick={() => selectedId && updateElement(selectedId, { effect: 'neon', color: '#ff00ff' })}
                className="w-full py-8 bg-neutral-900 border border-neutral-800 rounded hover:border-purple-500 flex items-center justify-center"
               >
                 <span className="text-2xl font-bold text-white" style={{ textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff' }}>GLOW</span>
               </button>
             </div>
           )}
           {activeTool === 'settings' && (
             <div className="space-y-4">
               <h3 className="font-semibold text-neutral-200">Product Settings</h3>
               <div className="space-y-2">
                 <label className="text-xs text-neutral-500">Product Type</label>
                 <div className="flex flex-col gap-2">
                   <button onClick={() => setProduct('tshirt')} className={`flex items-center gap-3 p-2 rounded ${product === 'tshirt' ? 'bg-cyan-900/30 border border-cyan-500/50' : 'bg-neutral-800'}`}>
                     <Shirt className="w-5 h-5" /> T-Shirt
                   </button>
                   <button onClick={() => setProduct('mug')} className={`flex items-center gap-3 p-2 rounded ${product === 'mug' ? 'bg-cyan-900/30 border border-cyan-500/50' : 'bg-neutral-800'}`}>
                     <Coffee className="w-5 h-5" /> Mug
                   </button>
                   <button onClick={() => setProduct('neon')} className={`flex items-center gap-3 p-2 rounded ${product === 'neon' ? 'bg-cyan-900/30 border border-cyan-500/50' : 'bg-neutral-800'}`}>
                     <Lightbulb className="w-5 h-5" /> Neon Sign
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Main Canvas Area */}
        <main className="flex-1 bg-[#1a1a1a] relative flex items-center justify-center overflow-hidden">
          
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-6 flex gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 z-10">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-2 hover:bg-neutral-800 rounded"><ZoomOut className="w-4 h-4"/></button>
            <span className="flex items-center px-2 text-xs font-mono w-12 justify-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 hover:bg-neutral-800 rounded"><ZoomIn className="w-4 h-4"/></button>
          </div>

          {viewMode === '2d' && (
            <div 
              className="relative transition-transform duration-200 ease-out shadow-2xl"
              style={{ 
                width: '600px', 
                height: '600px', 
                transform: `scale(${zoom / 100})`,
                backgroundColor: product === 'neon' ? '#000' : '#fff',
                backgroundImage: product === 'tshirt' 
                  ? 'radial-gradient(circle at 50% 50%, #f5f5f5 0%, #eee 100%)' 
                  : product === 'neon' 
                  ? 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)'
                  : 'none'
              }}
              ref={canvasRef}
            >
              {/* Product Background Overlay (Simplified Mockup) */}
              {product === 'tshirt' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M20.38 3.46L16 2l-4 6-4-6-4.38 1.46L4 16h2v6h12v-6h2l.38-12.54z"/></svg>')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                />
              )}

              {/* Design Elements */}
              {elements.map(el => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${el.x}px), calc(-50% + ${el.y}px)) rotate(${el.rotation}deg)`,
                    cursor: 'move',
                    border: selectedId === el.id ? '2px solid #00ffcc' : '2px solid transparent',
                    padding: '4px',
                  }}
                  className="group"
                >
                  {el.type === 'text' ? (
                    <div 
                      style={{ 
                        color: el.color, 
                        fontFamily: el.fontFamily, 
                        fontSize: `${el.fontSize}px`,
                        whiteSpace: 'nowrap',
                        textShadow: el.effect === 'neon' ? `0 0 5px ${el.color}, 0 0 10px ${el.color}, 0 0 20px ${el.color}` : 'none',
                        opacity: el.opacity
                      }}
                    >
                      {el.content}
                    </div>
                  ) : (
                    <div style={{ width: el.width, height: el.height, backgroundColor: el.color }} />
                  )}
                  
                  {/* Selection Handles (Visual only for prototype) */}
                  {selectedId === el.id && (
                    <>
                      <div className="absolute -top-2 -left-2 w-3 h-3 bg-white border border-cyan-500 rounded-full" />
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-white border border-cyan-500 rounded-full" />
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white border border-cyan-500 rounded-full" />
                      <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-white border border-cyan-500 rounded-full" />
                    </>
                  )}
                </div>
              ))}
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20" 
                style={{ 
                  backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} 
              />
            </div>
          )}

          {viewMode === '3d' && (
            <div className="w-full h-full p-10">
              <ThreePreview productType={product} designElements={elements} />
            </div>
          )}

          {viewMode === 'vr' && (
            <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-8 bg-[url('https://images.unsplash.com/photo-1622979135228-5118441e9ee1?auto=format&fit=crop&q=80')] bg-cover">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <div className="relative z-10 max-w-2xl">
                <Glasses className="w-24 h-24 text-purple-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Try Oonj VR</h2>
                <p className="text-xl text-neutral-300 mb-8">
                  Immerse yourself in the virtual design studio. Connect your headset to step inside your creation.
                </p>
                <div className="flex justify-center gap-4">
                  <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-bold text-lg shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105">
                    Launch VR Experience
                  </button>
                  <button 
                    onClick={() => setViewMode('2d')}
                    className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 rounded-full font-bold text-lg"
                  >
                    Exit VR Mode
                  </button>
                </div>
                <div className="mt-12 grid grid-cols-3 gap-8 text-sm text-neutral-500">
                  <div className="flex flex-col items-center gap-2">
                    <Monitor className="w-6 h-6" />
                    <span>Meta Quest 3 Compatible</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Move className="w-6 h-6" />
                    <span>Hand Tracking</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Share2 className="w-6 h-6" />
                    <span>Multi-user Sessions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Right Properties Panel */}
        <aside className="w-72 bg-[#121212] border-l border-neutral-800 p-4 overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-200">Properties</h3>
                <button onClick={() => deleteElement(selectedElement.id)} className="text-red-500 hover:text-red-400 p-1 hover:bg-red-900/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Text Content */}
              {selectedElement.type === 'text' && (
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 uppercase font-bold">Content</label>
                  <input 
                    type="text" 
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-cyan-500 outline-none transition-colors"
                  />
                </div>
              )}

              {/* Transforms */}
              <div className="space-y-4 border-t border-neutral-800 pt-4">
                <label className="text-xs text-neutral-500 uppercase font-bold">Transform</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neutral-900 p-2 rounded flex items-center gap-2">
                    <Move className="w-3 h-3 text-neutral-500" />
                    <span className="text-xs text-neutral-400">X: {Math.round(selectedElement.x)}</span>
                  </div>
                  <div className="bg-neutral-900 p-2 rounded flex items-center gap-2">
                    <Move className="w-3 h-3 text-neutral-500 rotate-90" />
                    <span className="text-xs text-neutral-400">Y: {Math.round(selectedElement.y)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-neutral-500" />
                  <input 
                    type="range" min="0" max="360" 
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs w-8 text-right">{selectedElement.rotation}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-4">Sz</span>
                  <input 
                    type="range" min="10" max="200" 
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs w-8 text-right">{selectedElement.fontSize}px</span>
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-4 border-t border-neutral-800 pt-4">
                <label className="text-xs text-neutral-500 uppercase font-bold">Appearance</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Color</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={selectedElement.color}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-neutral-400 uppercase">{selectedElement.color}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm text-neutral-300">Effects</label>
                   <div className="grid grid-cols-3 gap-2">
                     {['none', 'shadow', 'neon'].map(effect => (
                       <button
                         key={effect}
                         onClick={() => updateElement(selectedElement.id, { effect: effect as any })}
                         className={`px-2 py-1 text-xs rounded border ${selectedElement.effect === effect ? 'border-cyan-500 bg-cyan-900/30 text-cyan-400' : 'border-neutral-700 hover:border-neutral-500'}`}
                       >
                         {effect.charAt(0).toUpperCase() + effect.slice(1)}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-300">Opacity</label>
                  <input 
                    type="range" min="0" max="1" step="0.1"
                    value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center space-y-4">
              <MousePointer2 className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select an element on the canvas to edit its properties.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// Helper Component for Tool Buttons
const ToolButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-full p-2 transition-colors relative ${active ? 'text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-cyan-900/30' : ''}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-[10px] font-medium">{label}</span>
    {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400" />}
  </button>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
