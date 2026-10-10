import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WindPoint } from '../types/climaWind';
import { cn } from '../../../shared/utils/cn';
import { Navigation } from 'lucide-react';
import { getWindColor } from '../../../shared/lib/weatherUtils';
import { createPortal } from 'react-dom';

// Coordenadas centrais de Jericoacoara — ponto de referência do mapa
const JERI_LAT = -2.81;
const JERI_LON = -40.48;

interface WindMapLeafletProps {
  points: WindPoint[];
}

interface Particle {
  x: number;
  y: number;
  age: number;
}

export function WindMapLeaflet({ points }: WindMapLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const createParticle = (width: number, height: number): Particle => ({
    x: Math.random() * width,
    y: Math.random() * height,
    age: Math.floor(Math.random() * 100),
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([JERI_LAT, JERI_LON], 11);

    leafletMap.current = map;
    setMapInstance(map);

    L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(leafletMap.current);

    type LeafletLayerConstructor = new () => L.Layer;
    type LeafletLayerFactory = {
      extend(options: Record<string, unknown>): LeafletLayerConstructor;
    };

    const CustomLayer = (L.Layer as unknown as LeafletLayerFactory).extend({
      onAdd: function (map: L.Map) {
        const canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvasRef.current = canvas;
        map.getPanes().overlayPane.appendChild(canvas);

        const reset = () => {
          const size = map.getSize();
          canvas.width = size.x;
          canvas.height = size.y;
          canvas.style.width = size.x + 'px';
          canvas.style.height = size.y + 'px';
          const topLeft = map.containerPointToLayerPoint([0, 0]);
          L.DomUtil.setPosition(canvas, topLeft);

          // Re-seed particles on resize
          particles.current = Array.from({ length: 1800 }, () => createParticle(size.x, size.y));
        };

        map.on('moveend zoomend viewreset', reset);
        reset();
      },
      onRemove: function () {
        if (canvasRef.current) {
          L.DomUtil.remove(canvasRef.current);
          canvasRef.current = null;
        }
      },
    }) as unknown as LeafletLayerConstructor;

    const windLayer = new CustomLayer();
    windLayer.addTo(leafletMap.current);

    setMapReady(true);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        setMapInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    const animate = () => {
      const canvas = canvasRef.current;
      const map = leafletMap.current;
      if (!canvas || !map) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Project points to screen coordinates once per frame
      const projected = points.map((p) => {
        const pnt = map.latLngToContainerPoint([p.lat, p.lng]);
        const rad = ((p.dir ?? 90) * Math.PI) / 180;
        return {
          x: pnt.x,
          y: pnt.y,
          u: -(p.speed ?? 15) * Math.sin(rad),
          v: -(p.speed ?? 15) * Math.cos(rad),
          speed: p.speed ?? 15,
        };
      });

      const avgSpeed =
        points.length > 0 ? points.reduce((acc, p) => acc + (p.speed || 0), 0) / points.length : 15;

      // Trail Effect (Liquid Glass Feel)
      const fade = Math.max(0.85, 0.94 - avgSpeed * 0.004);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      // Design Particle Look (Vibrant & Flowing)
      ctx.lineWidth = Math.min(1.5, 0.8 + avgSpeed * 0.02);

      const baseScale = 0.12 + avgSpeed * 0.03;

      particles.current.forEach((p) => {
        // Calculate localized vector using IDW (Inverse Distance Weighting)
        let sumU = 0;
        let sumV = 0;
        let sumS = 0;
        let totalW = 0;

        for (const pt of projected) {
          const dx = p.x - pt.x;
          const dy = p.y - pt.y;
          const distSq = dx * dx + dy * dy;
          const wgt = 1 / (distSq + 800); // Smooth falloff — ajustado para grade mais densa
          sumU += pt.u * wgt;
          sumV += pt.v * wgt;
          sumS += pt.speed * wgt;
          totalW += wgt;
        }

        const u = totalW > 0 ? sumU / totalW : 0;
        const v = totalW > 0 ? sumV / totalW : 0;
        const localSpeed = totalW > 0 ? sumS / totalW : 15;

        ctx.beginPath();
        // Subtle color variation per local speed
        ctx.strokeStyle = localSpeed > 22 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(34, 211, 238, 0.5)';

        if (p.age % 10 === 0) {
          ctx.strokeStyle =
            localSpeed > 22
              ? `rgba(74, 222, 128, ${0.3 + Math.random() * 0.3})`
              : `rgba(34, 211, 238, ${0.3 + Math.random() * 0.3})`;
        }

        ctx.moveTo(p.x, p.y);
        p.x += u * baseScale;
        p.y += v * baseScale;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        p.age++;
        if (
          p.x < -20 ||
          p.x > w + 20 ||
          p.y < -20 ||
          p.y > h + 20 ||
          p.age > 80 + Math.random() * 40
        ) {
          const fresh = createParticle(w, h);
          p.x = fresh.x;
          p.y = fresh.y;
          p.age = 0;
        }
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [mapReady, points]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-[2.5rem] overflow-hidden" />

      {/* React UI Overlays (Markers) */}
      {mapReady &&
        mapInstance &&
        points
          .filter((p) => p.name && p.name.trim() !== '')
          .map((p) => <MapMarker key={p.id} map={mapInstance} point={p} />)}
    </div>
  );
}

interface MapMarkerProps {
  map: L.Map;
  point: WindPoint;
}

// Helper to project Leaflet coordinates into React DOM space
const MapMarker: React.FC<MapMarkerProps> = ({ map, point }) => {
  const [pos, setPos] = useState<L.Point | null>(null);

  useEffect(() => {
    const updatePos = () => {
      setPos(map.latLngToContainerPoint([point.lat, point.lng]));
    };

    map.on('move zoom viewreset', updatePos);
    updatePos();
    return () => {
      map.off('move zoom viewreset', updatePos);
    };
  }, [map, point.lat, point.lng]);

  if (!pos) return null;

  return createPortal(
    <div
      className="absolute pointer-events-auto"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
      }}
    >
      <div className="group relative flex flex-col items-center">
        <div
          className={cn(
            'absolute -inset-8 blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-40',
            (point.speed || 0) > 22 ? 'bg-green-400' : 'bg-cyan-400'
          )}
        />

        <div className="flex flex-col items-center gap-1.5 group-hover:scale-110 transition-all duration-500 relative">
          <div className="bg-white/10 backdrop-blur-3xl px-3 py-2 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 overflow-hidden ring-1 ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <Navigation
              size={18}
              className={cn(
                'transition-transform duration-1000 filter drop-shadow-sm',
                getWindColor(point.speed || 0)
              )}
              style={{ transform: `rotate(${(point.dir || 0) + 180}deg)` }}
            />
            <span className="text-base font-black tabular-nums text-white drop-shadow-md">
              {point.speed}{' '}
              <span className="text-[10px] opacity-60 font-bold tracking-tight">KTS</span>
            </span>
          </div>

          <div className="relative">
            <div className="w-3 h-3 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse" />
            <div className="absolute inset-0 bg-white rounded-full blur-[2px] scale-150 opacity-20" />
          </div>

          <div className="mt-1 bg-black/60 px-2.5 py-1 rounded-xl border border-white/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
            <span className="text-[10px] font-black uppercase text-white/90 tracking-[0.15em] drop-shadow-sm">
              {point.name}
            </span>
          </div>
        </div>
      </div>
    </div>,
    map.getContainer()
  );
};
