import React, { useEffect, useRef } from 'react';

interface PixelCanvasProps {
  colors?: string[];
  speed?: number;
  gap?: number;
  pixelSize?: number;
  className?: string;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colors = ['#e879f9', '#a78bfa', '#38bdf8', '#22d3ee'],
  speed = 0.02,
  gap = 6,
  pixelSize = 4,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use IntersectionObserver to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    let cols = 0;
    let rows = 0;
    let grid: {
      color: string;
      targetAlpha: number;
      currentAlpha: number;
      phase: number;
      speed: number;
    }[] = [];

    const setupGrid = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || 400;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      const cellSize = pixelSize + gap;
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);

      grid = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          grid.push({
            color,
            targetAlpha: Math.random() < 0.15 ? Math.random() * 0.7 + 0.2 : 0.03,
            currentAlpha: Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
            speed: (Math.random() * 0.5 + 0.5) * speed,
          });
        }
      }
    };

    setupGrid();

    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      const width = parseFloat(canvas.style.width);
      const height = parseFloat(canvas.style.height);

      ctx.clearRect(0, 0, width, height);

      const cellSize = pixelSize + gap;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const pixel = grid[idx];
          if (!pixel) continue;

          pixel.phase += pixel.speed;
          const wave = Math.sin(pixel.phase);

          // Subtle twinkle modulation
          if (wave > 0.95 && Math.random() < 0.02) {
            pixel.targetAlpha = Math.random() * 0.8 + 0.2;
            pixel.color = colors[Math.floor(Math.random() * colors.length)];
          } else if (wave < -0.9) {
            pixel.targetAlpha = 0.02;
          }

          // Smooth interpolation
          pixel.currentAlpha += (pixel.targetAlpha - pixel.currentAlpha) * 0.04;

          if (pixel.currentAlpha > 0.01) {
            ctx.fillStyle = pixel.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, pixel.currentAlpha));
            ctx.beginPath();
            ctx.roundRect
              ? ctx.roundRect(c * cellSize, r * cellSize, pixelSize, pixelSize, 1.5)
              : ctx.rect(c * cellSize, r * cellSize, pixelSize, pixelSize);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      setupGrid();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colors, speed, gap, pixelSize]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
    </div>
  );
};
