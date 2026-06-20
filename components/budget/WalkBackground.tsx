'use client';

import { useEffect, useRef, useState } from 'react';

interface CelestialBody {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
  drift: number;
  hasRing: boolean;
}

export default function WalkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<CelestialBody[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);

  const playCuteSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audio = audioContextRef.current;
      const now = audio.currentTime;

      const osc1 = audio.createOscillator();
      const gain1 = audio.createGain();
      const filter = audio.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.value = 1180;
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      gain1.gain.value = 0.22;
      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      const osc2 = audio.createOscillator();
      const gain2 = audio.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 740;
      gain2.gain.value = 0.12;
      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(audio.destination);
      osc2.connect(gain2);
      gain2.connect(audio.destination);

      osc1.start(now);
      osc2.start(now + 0.02);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.55);
    } catch (_) {}
  };

  const spawnBody = (x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hasRing = Math.random() > 0.6;

    const body: CelestialBody = {
      x: x ?? Math.random() * canvas.width,
      y: y ?? canvas.height * 0.25 + Math.random() * (canvas.height * 0.55),
      size: hasRing ? 8 + Math.random() * 10 : 5 + Math.random() * 9,
      speed: 0.1 + Math.random() * 0.15,
      alpha: 0.5 + Math.random() * 0.35,
      color: ['#a5b4fc', '#bae6fd', '#fed7aa', '#e0e7ff'][Math.floor(Math.random() * 4)],
      drift: (Math.random() - 0.5) * 0.25,
      hasRing,
    };

    bodiesRef.current.push(body);
    if (bodiesRef.current.length > 22) bodiesRef.current.shift();
    playCuteSound();
  };

  useEffect(() => {
    (window as any).spawnCelestial = spawnBody;
    return () => {
      delete (window as any).spawnCelestial;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2;
      setMousePos({ x: x * 14, y: y * 9 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bodiesRef.current = bodiesRef.current.filter(b => b.alpha > 0.06);

      bodiesRef.current.forEach(body => {
        body.x += body.drift;
        body.y -= body.speed;
        body.alpha *= 0.997;

        ctx.save();
        ctx.globalAlpha = body.alpha;

        const glow = ctx.createRadialGradient(
          body.x, body.y, body.size * 0.4,
          body.x, body.y, body.size * 2.6
        );
        glow.addColorStop(0, body.color);
        glow.addColorStop(0.5, body.color + '55');
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.size * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = body.color;
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.size, 0, Math.PI * 2);
        ctx.fill();

        if (body.hasRing) {
          ctx.strokeStyle = body.color + '99';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(body.x, body.y, body.size * 2, body.size * 0.5, Math.PI / 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/asteroid-path.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          animation: 'asteroidWalk 32s linear infinite',
          willChange: 'transform',
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/42" />
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 -z-10 pointer-events-none" 
      />
    </>
  );
}
