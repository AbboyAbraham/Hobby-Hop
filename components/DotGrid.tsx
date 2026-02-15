'use client';
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { gsap } from 'gsap';

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _isAnimating: boolean;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  returnDuration?: number;
  className?: string;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16)
  };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 3,
  gap = 25,
  baseColor = '#113320',
  activeColor = '#588b89',
  proximity = 120,
  shockRadius = 300,
  shockStrength = 8,
  returnDuration = 1.2,
  className = ''
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mobileCheck = width < 768;
    setIsMobile(mobileCheck);

    // If mobile, we increase the gap to render fewer dots
    const effectiveGap = mobileCheck ? gap * 1.5 : gap;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cell = dotSize + effectiveGap;
    const cols = Math.floor(width / cell) + 1;
    const rows = Math.floor(height / cell) + 1;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({ cx: x * cell, cy: y * cell, xOffset: 0, yOffset: 0, _isAnimating: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) return;
    let rafId: number;
    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // On mobile, we skip the proximity color change to save CPU
      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        let style = baseColor;
        
        if (!isMobile) {
          const dx = dot.cx - px;
          const dy = dot.cy - py;
          const dsq = dx * dx + dy * dy;
          if (dsq <= proxSq) {
            const t = 1 - Math.sqrt(dsq) / proximity;
            const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
            const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
            const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
            style = `rgb(${r},${g},${b})`;
          }
        }

        ctx.save();
        ctx.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
        ctx.fillStyle = style;
        ctx.fill(circlePath);
        ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [isMobile, proximity, baseColor, activeRgb, baseRgb, circlePath]);

  useEffect(() => {
    buildGrid();
    window.addEventListener('resize', buildGrid);
    return () => window.removeEventListener('resize', buildGrid);
  }, [buildGrid]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    };

    const onClick = (e: MouseEvent) => {
      // Mobile users tap, which triggers click
      const rect = canvasRef.current!.getBoundingClientRect();
      const clientX = e.clientX || (e as any).touches?.[0].clientX;
      const clientY = e.clientY || (e as any).touches?.[0].clientY;
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - cx;
        const dy = dot.cy - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < shockRadius && !dot._isAnimating) {
          dot._isAnimating = true;
          const falloff = 1 - dist / shockRadius;
          gsap.to(dot, {
            xOffset: dx * shockStrength * 0.1 * falloff,
            yOffset: dy * shockStrength * 0.1 * falloff,
            duration: 0.2,
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1, 0.3)",
                onComplete: () => { dot._isAnimating = false; }
              });
            }
          });
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, [shockRadius, shockStrength, returnDuration]);

  return (
    <div ref={wrapperRef} className={`w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
};

export default DotGrid; 
