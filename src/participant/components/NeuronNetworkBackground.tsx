import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  corner: 'tl' | 'tr' | 'bl' | 'br';
  pulse: number;
  pulseSpeed: number;
}

export interface NeuronNetworkBackgroundProps {
  className?: string;
}

export const NeuronNetworkBackground: React.FC<NeuronNetworkBackgroundProps> = ({
  className = 'fixed inset-0 pointer-events-none z-0 opacity-70',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    const isMobile = width < 768;
    const nodesPerCorner = isMobile ? 6 : 14;
    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const corners: ('tl' | 'tr' | 'bl' | 'br')[] = ['tl', 'tr', 'bl', 'br'];

      corners.forEach((corner) => {
        for (let i = 0; i < nodesPerCorner; i++) {
          let baseX = 0;
          let baseY = 0;
          const spread = Math.min(width, height) * 0.38;

          if (corner === 'tl') {
            baseX = Math.random() * spread;
            baseY = Math.random() * spread;
          } else if (corner === 'tr') {
            baseX = width - Math.random() * spread;
            baseY = Math.random() * spread;
          } else if (corner === 'bl') {
            baseX = Math.random() * spread;
            baseY = height - Math.random() * spread;
          } else if (corner === 'br') {
            baseX = width - Math.random() * spread;
            baseY = height - Math.random() * spread;
          }

          nodes.push({
            x: baseX,
            y: baseY,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 2 + 1.2,
            corner,
            pulse: Math.random() * Math.PI,
            pulseSpeed: 0.02 + Math.random() * 0.02,
          });
        }
      });
    };

    initNodes();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions & draw connections
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;
        nodeA.pulse += nodeA.pulseSpeed;

        // Subtle boundary drift clamping per corner
        const spread = Math.min(width, height) * 0.42;
        if (nodeA.corner === 'tl' && (nodeA.x > spread || nodeA.y > spread || nodeA.x < 0 || nodeA.y < 0)) {
          nodeA.vx *= -1;
          nodeA.vy *= -1;
        } else if (nodeA.corner === 'tr' && (nodeA.x < width - spread || nodeA.y > spread || nodeA.x > width || nodeA.y < 0)) {
          nodeA.vx *= -1;
          nodeA.vy *= -1;
        } else if (nodeA.corner === 'bl' && (nodeA.x > spread || nodeA.y < height - spread || nodeA.x < 0 || nodeA.y > height)) {
          nodeA.vx *= -1;
          nodeA.vy *= -1;
        } else if (nodeA.corner === 'br' && (nodeA.x < width - spread || nodeA.y < height - spread || nodeA.x > width || nodeA.y > height)) {
          nodeA.vx *= -1;
          nodeA.vy *= -1;
        }

        // Draw node with subtle glow
        const currentAlpha = 0.25 + 0.2 * Math.sin(nodeA.pulse);
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 167, 255, ${currentAlpha})`;
        ctx.fill();

        // Connect only within same or neighboring node in corner
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          if (nodeA.corner === nodeB.corner) {
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = isMobile ? 100 : 160;

            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.18;
              ctx.beginPath();
              ctx.moveTo(nodeA.x, nodeA.y);
              ctx.lineTo(nodeB.x, nodeB.y);
              ctx.strokeStyle = `rgba(30, 167, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
};
