'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FireworksBackgroundProps {
  className?: string;
  population?: number;
  fireworkSpeed?: { min: number; max: number };
  fireworkSize?: { min: number; max: number };
  particleSpeed?: { min: number; max: number };
  particleSize?: { min: number; max: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function FireworksBackground({
  className,
  population = 8,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 3, max: 7 },
  particleSpeed = { min: 3, max: 8 },
  particleSize = { min: 2, max: 6 },
}: FireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const colors = [
      '#fbbf24', // yellow-400
      '#f59e0b', // amber-500
      '#f97316', // orange-500
      '#ef4444', // red-500
      '#ec4899', // pink-500
      '#8b5cf6', // violet-500
      '#3b82f6', // blue-500
      '#10b981', // emerald-500
    ];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      // Create initial burst of particles
      for (let i = 0; i < population; i++) {
        createFirework(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }
    };

    const createFirework = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleCount = 8 + Math.floor(Math.random() * 12); // 8-20 particles per explosion

      for (let i = 0; i < particleCount; i++) {
        const angle =
          (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed =
          particleSpeed.min +
          Math.random() * (particleSpeed.max - particleSpeed.min);

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          color,
          size:
            particleSize.min +
            Math.random() * (particleSize.max - particleSize.min),
        });
      }
    };

    const updateParticles = () => {
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.08; // gravity
        particle.vx *= 0.99; // air resistance
        particle.vy *= 0.99; // air resistance
        particle.life++;

        return particle.life < particle.maxLife;
      });

      // Create new firework bursts periodically
      if (Math.random() < 0.02) {
        // 2% chance each frame
        createFirework(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }
    };

    const drawParticles = () => {
      // Clear canvas completely for each frame (no fade effect)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        const alpha = 1 - particle.life / particle.maxLife;
        const size = particle.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Step 2: Draw the main particle with bright color
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Step 3: Add glow effect (this creates the "fire" look)
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 20; // Bigger glow
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Step 4: Add trail effect (this creates the motion blur)
        ctx.shadowBlur = 10;
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(
          particle.x - particle.vx * 3, // Longer trail
          particle.y - particle.vy * 3,
          size * 0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Step 5: Add sparkle effect (small bright dots)
        ctx.shadowBlur = 5;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [population, fireworkSpeed, fireworkSize, particleSpeed, particleSize]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 pointer-events-none w-full h-full',
        className
      )}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
