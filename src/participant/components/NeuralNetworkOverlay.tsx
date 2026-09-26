import React, { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

interface Particle {
  radius: number;
  distance: number;
  angle: number;
  speed: number;
}

export interface NeuralNetworkOverlayProps {
  progress: MotionValue<number> | number;
  className?: string;
  pupilCenter?: { xPercent: number; yPercent: number };
}

export const NeuralNetworkOverlay: React.FC<NeuralNetworkOverlayProps> = ({
  progress,
  className = '',
  pupilCenter = { xPercent: 50.98, yPercent: 46.88 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 768;
    // Tightly capped particle counts for guaranteed 60fps performance
    const maxParticles = isMobile ? 30 : 54;
    const minParticles = isMobile ? 8 : 14;
    const connectionMaxDist = isMobile ? 60 : 78;
    const connectionMaxDistSq = connectionMaxDist * connectionMaxDist;

    let particles: Particle[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap DPR to 1.25 to prevent 4K GPU fill-rate throttling
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const maxRadius = Math.hypot(width, height) * 0.45;
      return {
        radius: 1.1 + Math.random() * 1.5,
        distance: Math.random() * maxRadius,
        angle,
        speed: 0.9 + Math.random() * 1.3,
      };
    };

    particles = Array.from({ length: maxParticles }, () => createParticle());

    const render = () => {
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Read current progress value directly from MotionValue (0 -> 1)
      const rawP = typeof progress === 'number' ? progress : progress.get();
      const p = Math.max(0, Math.min(1, rawP));

      const targetCount = Math.floor(minParticles + (maxParticles - minParticles) * Math.pow(p, 1.1));
      const speedMultiplier = 1 + p * 8.0;

      const originX = (width * pupilCenter.xPercent) / 100;
      const originY = (height * pupilCenter.yPercent) / 100;
      const maxDistance = Math.hypot(width, height);

      const activeNodes: { x: number; y: number; r: number; alpha: number }[] = [];

      for (let i = 0; i < targetCount; i++) {
        const pt = particles[i];
        if (!pt) continue;

        pt.distance += pt.speed * speedMultiplier;
        if (pt.distance > maxDistance * 0.75) {
          pt.distance = Math.random() * 20 + 5;
          pt.angle = Math.random() * Math.PI * 2;
        }

        const px = originX + Math.cos(pt.angle) * pt.distance;
        const py = originY + Math.sin(pt.angle) * pt.distance;

        // Skip particles outside viewport
        if (px < -15 || px > width + 15 || py < -15 || py > height + 15) {
          continue;
        }

        const travelRatio = pt.distance / (maxDistance * 0.65);
        const dynamicAlpha = Math.min(1, Math.sin(travelRatio * Math.PI)) * (0.35 + p * 0.65);

        activeNodes.push({
          x: px,
          y: py,
          r: pt.radius * (1 + p * 0.3),
          alpha: dynamicAlpha,
        });
      }

      const nodeLen = activeNodes.length;

      // 1. Batch draw all connection lines in a single stroke call
      ctx.beginPath();
      for (let i = 0; i < nodeLen; i++) {
        const n1 = activeNodes[i];
        for (let j = i + 1; j < nodeLen; j++) {
          const n2 = activeNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionMaxDistSq) {
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.strokeStyle = `rgba(30, 167, 255, ${0.22 + p * 0.35})`;
      ctx.lineWidth = 0.8 + p * 0.5;
      ctx.stroke();

      // 2. Batch draw glowing node halos
      ctx.beginPath();
      for (let i = 0; i < nodeLen; i++) {
        const n = activeNodes[i];
        ctx.moveTo(n.x + n.r * 2.2, n.y);
        ctx.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2);
      }
      ctx.fillStyle = `rgba(30, 167, 255, ${0.15 + p * 0.25})`;
      ctx.fill();

      // 3. Batch draw node cores
      ctx.beginPath();
      for (let i = 0; i < nodeLen; i++) {
        const n = activeNodes[i];
        ctx.moveTo(n.x + n.r, n.y);
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'rgba(210, 240, 255, 0.9)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [progress, pupilCenter.xPercent, pupilCenter.yPercent]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-20 w-full h-full ${className}`}
    />
  );
};

export default NeuralNetworkOverlay;
