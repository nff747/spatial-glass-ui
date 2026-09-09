import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { SpatialEngine, GlassPanelConfig } from './core/SpatialEngine';

const EngineContext = createContext<SpatialEngine | null>(null);

export const GlassProvider = ({ children, className }: { children: ReactNode, className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpatialEngine | null>(null);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new SpatialEngine(canvasRef.current);
      engineRef.current.start();
    }
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className={className}>
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }} 
      />
      <EngineContext.Provider value={engineRef.current}>
        {children}
      </EngineContext.Provider>
    </div>
  );
};

interface BaseGlassProps {
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  depth?: number;
  tint?: [number, number, number, number];
  refraction?: number;
  chromaticAberration?: number;
  roughness?: number;
  cornerRadius?: number;
}

export const GlassPanel = ({ 
  children, style, className, depth = 100, tint = [0.1, 0.1, 0.1, 0.5], 
  refraction = 0.15, chromaticAberration = 0.08, roughness = 0.3, cornerRadius = 24 
}: BaseGlassProps) => {
  const engine = useContext(EngineContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (engine && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const style = window.getComputedStyle(ref.current);
      const blur = style.getPropertyValue('--glass-blur') || roughness.toString();
      const ab = style.getPropertyValue('--glass-aberration') || chromaticAberration.toString();
      
      engine.addPanel({
        x: rect.left,
        y: rect.top,
        z: depth,
        width: rect.width,
        height: rect.height,
        cornerRadius,
        tint,
        refraction,
        chromaticAberration: parseFloat(ab),
        roughness: parseFloat(blur),
      });
    }
  }, [engine, depth, tint, refraction, chromaticAberration, roughness, cornerRadius]);

  return <div ref={ref} className={className} style={{ ...style, position: 'relative' }}>{children}</div>;
};

export const GlassCard = (props: BaseGlassProps) => <GlassPanel {...props} depth={props.depth || 200} cornerRadius={props.cornerRadius || 16} />;
export const GlassButton = (props: BaseGlassProps & { onClick?: () => void }) => (
  <button onClick={props.onClick} style={{ ...props.style, position: 'relative', border: 'none', background: 'transparent' }} className={props.className}>
    <GlassPanel {...props} depth={props.depth || 300} cornerRadius={props.cornerRadius || 8}>
      {props.children}
    </GlassPanel>
  </button>
);
export const HoloChart = (props: BaseGlassProps) => <GlassPanel {...props} depth={props.depth || 150} tint={[0.0, 0.5, 1.0, 0.4]} cornerRadius={props.cornerRadius || 12} />;
