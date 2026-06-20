'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { CAT_COLORS, CAT_FALLBACK } from '@/lib/catColors';
import { useSurface } from '@/lib/useSurface';

interface Moon {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  hasRing: boolean;
  ringThickness: number;
  rotation: number;
  rotationSpeed: number;
  hasCraters: boolean;
  shapeFactor: number;
}

// expenses live on profile.expenses in the store (written when "Calculate Budget" runs)
const getExpenses = (): any[] => {
  const p = useAppStore.getState().profile as any;
  return (p && Array.isArray(p.expenses)) ? p.expenses : [];
};

export default function WalkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moonsRef = useRef<Map<string, Moon>>(new Map());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasMountedRef = useRef(false);
  const surface = useSurface();

  useEffect(() => {
    setMounted(true);
  }, []);

  const playCuteSound = () => {
    if (!hasMountedRef.current) return;
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
      gain1.gain.value = 0.2;
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      const osc2 = audio.createOscillator();
      const gain2 = audio.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 740;
      gain2.gain.value = 0.11;
      gain2.gain.setValueAtTime(0.11, now);
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

  const createMoonStyle = (expense: any) => {
    const seed = String(expense.id).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const hasRing = (seed % 5) > 1;
    const ringThickness = 1.2 + (seed % 3) * 0.4;
    const hasCraters = (seed % 3) === 0;
    const shapeFactor = 1 + ((seed % 7) - 3) * 0.012;
    const rotationSpeed = 0.0006 + ((seed % 8) * 0.00012);
    return { hasRing, ringThickness, hasCraters, shapeFactor, rotationSpeed };
  };

  const getStablePosition = (id: string, width: number, height: number) => {
    const seed = String(id).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const x = (width * 0.12) + ((seed % 70) / 100) * (width * 0.76);
    const y = (height * 0.16) + ((seed % 55) / 100) * (height * 0.5);
    return { x, y };
  };

  const moonSize = (amount: number) => Math.max(6, Math.min(22, (amount || 0) / 45 + 6));

  const buildMoon = (exp: any, canvas: HTMLCanvasElement, alpha: number): Moon => {
    const style = createMoonStyle(exp);
    const pos = getStablePosition(exp.id, canvas.width, canvas.height);
    return {
      id: exp.id,
      x: pos.x,
      y: pos.y,
      size: moonSize(exp.amount),
      color: CAT_COLORS[exp.category] || CAT_FALLBACK,
      alpha,
      hasRing: style.hasRing,
      ringThickness: style.ringThickness,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: style.rotationSpeed,
      hasCraters: style.hasCraters,
      shapeFactor: style.shapeFactor,
    };
  };

  // Store subscription (imperative) + silent initial load.
  // expenses are read from profile.expenses (updated on "Calculate Budget").
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      getExpenses().forEach((exp: any) => {
        if (exp && exp.id && !moonsRef.current.has(exp.id)) {
          moonsRef.current.set(exp.id, buildMoon(exp, canvas, 0.82));
        }
      });
    }
    hasMountedRef.current = true;

    const unsubscribe = useAppStore.subscribe(() => {
      const currentExpenses = getExpenses();
      const currentMoons = moonsRef.current;
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      currentExpenses.forEach((exp: any) => {
        if (exp && exp.id && !currentMoons.has(exp.id)) {
          currentMoons.set(exp.id, buildMoon(exp, canvasEl, 0));
          playCuteSound();
        }
      });
    });

    return unsubscribe;
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2;
      setMousePos({ x: x * 13, y: y * 8 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas animation
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

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const moons = moonsRef.current;
      const liveIds = new Set(getExpenses().map((e: any) => e && e.id));

      moons.forEach((moon, id) => {
        const stillExists = liveIds.has(id);
        if (stillExists) {
          if (moon.alpha < 0.82) moon.alpha = Math.min(moon.alpha + 0.04, 0.82);
        } else {
          moon.alpha *= 0.92;
          if (moon.alpha < 0.06) {
            moons.delete(id);
            return;
          }
        }

        if (moon.hasRing) moon.rotation += moon.rotationSpeed;

        ctx.save();
        ctx.globalAlpha = moon.alpha;

        const glow = ctx.createRadialGradient(
          moon.x, moon.y, moon.size * 0.35,
          moon.x, moon.y, moon.size * 2.5
        );
        glow.addColorStop(0, moon.color);
        glow.addColorStop(0.5, moon.color + '55');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = moon.color;
        ctx.beginPath();
        ctx.ellipse(moon.x, moon.y, moon.size * moon.shapeFactor, moon.size / moon.shapeFactor, 0, 0, Math.PI * 2);
        ctx.fill();

        if (moon.hasCraters) {
          ctx.fillStyle = '#00000033';
          ctx.beginPath();
          ctx.arc(moon.x - moon.size * 0.22, moon.y - moon.size * 0.18, moon.size * 0.18, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(moon.x + moon.size * 0.28, moon.y + moon.size * 0.22, moon.size * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }

        if (moon.hasRing) {
          ctx.strokeStyle = moon.color + 'bb';
          ctx.lineWidth = moon.ringThickness;
          ctx.save();
          ctx.translate(moon.x, moon.y);
          ctx.rotate(moon.rotation);
          ctx.beginPath();
          ctx.ellipse(0, 0, moon.size * 1.9, moon.size * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const reduced = mounted && typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const shouldAnimate = mounted && surface === 'web' && !reduced;

  if (!shouldAnimate) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: "url('/asteroid-path.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
        }}
      />
    );
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: "url('/asteroid-path.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          animation: 'asteroidWalk 32s linear infinite',
          willChange: 'transform',
        }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.25)' }} />
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}
      />
    </>
  );
}
