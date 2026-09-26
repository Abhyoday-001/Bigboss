import React, { useEffect, useRef } from 'react';

interface NeuronNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulse: number;
  pulseSpeed: number;
}

export interface NeuronNetworkBackgroundProps {
  className?: string;
  nodeCount?: number;
}

export const NeuronNetworkBackground: React.FC<NeuronNetworkBackgroundProps> = ({
  className = 'fixed inset-0 pointer-events-none z-0',
  nodeCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 768;
    const totalNodes = nodeCount ?? (isMobile ? 32 : 55);
    const maxConnectionDist = isMobile ? 95 : 135;
    const maxConnectionDistSq = maxConnectionDist * maxConnectionDist;

    let nodes: NeuronNode[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize nodes distributed across the entire viewport
    nodes = Array.from({ length: totalNodes }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1.2,
      baseAlpha: 0.35 + Math.random() * 0.45,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.02,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update node physics
      for (let i = 0; i < totalNodes; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        // Bounce gently at screen edges with smooth wrap-around or bounce
        if (n.x < -10) n.x = width + 10;
        else if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        else if (n.y > height + 10) n.y = -10;
      }

      // 2. Batch draw all connection lines in a SINGLE path for ultra-high FPS
      ctx.beginPath();
      for (let i = 0; i < totalNodes; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < totalNodes; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectionDistSq) {
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.strokeStyle = 'rgba(30, 167, 255, 0.16)';
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // 3. Batch draw node glows & cores in a SINGLE path
      ctx.beginPath();
      for (let i = 0; i < totalNodes; i++) {
        const n = nodes[i];
        const pulseScale = 1 + 0.25 * Math.sin(n.pulse);
        const r = n.radius * pulseScale;
        ctx.moveTo(n.x + r, n.y);
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'rgba(30, 167, 255, 0.65)';
      ctx.fill();

      // 4. Subtle bright center on nodes
      ctx.beginPath();
      for (let i = 0; i < totalNodes; i++) {
        const n = nodes[i];
        const r = n.radius * 0.45;
        ctx.moveTo(n.x + r, n.y);
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'rgba(220, 245, 255, 0.9)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
};

export default NeuronNetworkBackground;
