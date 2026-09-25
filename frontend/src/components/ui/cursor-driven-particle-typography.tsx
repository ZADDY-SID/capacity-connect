import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface CursorDrivenParticleTypographyProps {
  text: string;
  particleDensity?: number;
  particleSize?: number;
  fontSize?: number;
  className?: string;
}

export const CursorDrivenParticleTypography: React.FC<CursorDrivenParticleTypographyProps> = ({
  text = 'CAPACITY',
  particleDensity = 2,
  particleSize = 1.5,
  fontSize = 110,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      // Adaptive font size based on container width
      const responsiveFontSize = Math.min(fontSize, Math.floor(width / (text.length * 0.65)));
      const height = Math.max(130, Math.floor(responsiveFontSize * 1.35));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Create an offscreen canvas to sample text pixels
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.fillStyle = '#ffffff';
      offCtx.font = `900 ${responsiveFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const particles: Particle[] = [];
      // Adjust step based on density and device performance
      const isMobile = window.innerWidth < 768;
      const densityFactor = isMobile ? Math.max(1, particleDensity * 0.7) : particleDensity;
      const step = Math.max(2, Math.floor(6 / densityFactor));

      const colorPalette = [
        '#c084fc', // Purple
        '#a78bfa', // Lavender
        '#818cf8', // Indigo
        '#38bdf8', // Sky Blue
        '#22d3ee', // Cyan
        '#e879f9', // Bright Fuchsia
      ];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            // Pick color according to x coordinate for a smooth horizontal gradient
            const colorIdx = Math.floor((x / width) * colorPalette.length) % colorPalette.length;
            const pColor = colorPalette[colorIdx];

            particles.push({
              x: x + (Math.random() - 0.5) * 6,
              y: y + (Math.random() - 0.5) * 6,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: particleSize * (0.85 + Math.random() * 0.4),
              color: pColor,
            });
          }
        }
      }

      particlesRef.current = particles;
    };

    initParticles();

    // Physics Animation Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = container.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = parseFloat(canvas.style.height) || 140;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const radius = 90; // Cursor interaction zone
      const radiusSq = radius * radius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Cursor repulsion
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq && distSq > 0.1) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / radius) * 28;
              const angle = Math.atan2(dy, dx);
              p.vx -= Math.cos(angle) * force;
              p.vy -= Math.sin(angle) * force;
            }
          }

          // Spring return to rest origin
          const spring = 0.08;
          const friction = 0.84;

          p.vx += (p.originX - p.x) * spring;
          p.vy += (p.originY - p.y) * spring;

          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;
        } else {
          p.x = p.originX;
          p.y = p.originY;
        }

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Mouse & Touch Handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          active: true,
        };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, particleDensity, particleSize, fontSize]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{ minHeight: '120px' }}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair transition-opacity duration-300"
        title="Interactive particle typography - hover or drag cursor over letters"
      />
    </div>
  );
};
