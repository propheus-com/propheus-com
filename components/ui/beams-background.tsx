"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

interface BeamsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
  style?: React.CSSProperties;
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

const BEAM_COUNT = 12;

export function BeamsBackground({
  className,
  children,
  intensity = "strong",
  style,
}: BeamsBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const visibleRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const opacityMap = { subtle: 0.7, medium: 0.85, strong: 1 };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      // Use the wrapper's scroll dimensions — these are always correct even for
      // position:absolute elements, unlike getBoundingClientRect which can lag
      const w = wrapper.offsetWidth || wrapper.clientWidth;
      const h = wrapper.offsetHeight || wrapper.clientHeight;
      if (w === 0 || h === 0) return; // not laid out yet
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
        createBeam(w, h)
      );
    };

    updateCanvasSize();

    // ResizeObserver is more reliable than window resize for element-level size changes
    const ro = new ResizeObserver(() => updateCanvasSize());
    ro.observe(wrapper);

    // Pause animation when off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visibleRef.current;
        visibleRef.current = entry.isIntersecting;
        if (!wasVisible && entry.isIntersecting) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );
    io.observe(wrapper);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      const { w, h } = sizeRef.current;
      const column = index % 3;
      const spacing = w / 3;
      beam.y = h + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      // Premium Teal Gradient for the pulsing beam
        gradient.addColorStop(0, `hsla(180, 100%, 15%, 0)`);                   // Dark teal fade
        gradient.addColorStop(0.1, `hsla(180, 100%, 30%, ${pulsingOpacity * 0.5})`);  // Deeper teal
        gradient.addColorStop(0.4, `hsla(175, 100%, 50%, ${pulsingOpacity})`);        // Vibrant premium teal core
        gradient.addColorStop(0.6, `hsla(175, 100%, 50%, ${pulsingOpacity})`);        // Sustained core
        gradient.addColorStop(0.9, `hsla(180, 100%, 30%, ${pulsingOpacity * 0.5})`);  // Deeper teal
        gradient.addColorStop(1, `hsla(180, 100%, 15%, 0)`);                   // Dark teal fade
      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx || !visibleRef.current) return;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, index, totalBeams);
        drawBeam(ctx, beam);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      ro.disconnect();
      io.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(10px)" }}
      />
      {children}
    </div>
  );
}

export default BeamsBackground;
