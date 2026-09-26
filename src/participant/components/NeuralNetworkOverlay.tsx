import React, { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

interface Particle {
  radius: number;
  alpha: number;
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 45 : 85;
    const minParticles = isMobile ? 8 : 14;
    const connectionMaxDist = isMobile ? 65 : 85;

    let particles: Particle[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
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
      const maxRadius = Math.hypot(width, height) / 2;
      return {
        radius: 1.2 + Math.random() * 1.8,
        alpha: 0.3 + Math.random() * 0.7,
        distance: Math.random() * maxRadius,
        angle,
        speed: 0.8 + Math.random() * 1.4,
      };
    };

    particles = Array.from({ length: maxParticles }, () => createParticle());

    const render = () => {
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Read current smoothly interpolated progress value directly from MotionValue
      const rawP = typeof progress === 'number' ? progress : progress.get();
      const p = Math.max(0, Math.min(1, rawP));

      const targetCount = Math.floor(minParticles + (maxParticles - minParticles) * Math.pow(p, 1.2));
      const speedMultiplier = 1 + p * 7.5;

      const originX = (width * pupilCenter.xPercent) / 100;
      const originY = (height * pupilCenter.yPercent) / 100;
      const maxDistance = Math.hypot(width, height);

      const activeNodes: { x: number; y: number; alpha: number }[] = [];

      for (let i = 0; i < targetCount; i++) {
        const pt = particles[i];
        if (!pt) continue;

        pt.distance += pt.speed * speedMultiplier;
        if (pt.distance > maxDistance * 0.8) {
          pt.distance = Math.random() * 25 + 5;
          pt.angle = Math.random() * Math.PI * 2;
        }

        const px = originX + Math.cos(pt.angle) * pt.distance;
        const py = originY + Math.sin(pt.angle) * pt.distance;

        // Skip particles outside viewport bounds
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) {
          continue;
        }

        const travelRatio = pt.distance / (maxDistance * 0.65);
        const dynamicAlpha = Math.min(1, Math.sin(travelRatio * Math.PI)) * (0.35 + p * 0.65);

        // Halo
        ctx.beginPath();
        ctx.arc(px, py, pt.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 167, 255, ${dynamicAlpha * 0.35})`;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(px, py, pt.radius * (1 + p * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 255, ${dynamicAlpha})`;
        ctx.fill();

        activeNodes.push({ x: px, y: py, alpha: dynamicAlpha });
      }

      // Draw connection threads with fast distance thresholding
      const nodeLen = activeNodes.length;
      for (let i = 0; i < nodeLen; i++) {
        const n1 = activeNodes[i];
        for (let j = i + 1; j < nodeLen; j++) {
          const n2 = activeNodes[j];
          const dx = n1.x - n2.x;
          if (dx > connectionMaxDist || dx < -connectionMaxDist) continue;
          const dy = n1.y - n2.y;
          if (dy > connectionMaxDist || dy < -connectionMaxDist) continue;

          const dist = Math.hypot(dx, dy);
          if (dist < connectionMaxDist) {
            const lineAlpha = (1 - dist / connectionMaxDist) * 0.38 * Math.min(n1.alpha, n2.alpha);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(30, 167, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.9 + p * 0.6;
            ctx.stroke();
          }
        }
      }

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
