import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import TerrainPoints from './TerrainPoints';
import { useAudioAnalyser } from './useAudioAnalyser';

export interface ParticleTerrainProps {
  /** Approximate particle count on desktop. Auto-scaled down on mobile. */
  particleCount?: number;
  /** World size of the terrain plane. */
  size?: number;
  /** Vertical wave amplitude. */
  amplitude?: number;
  /** Forward drift speed of the noise field. */
  waveSpeed?: number;
  /** High-octave detail strength. */
  turbulence?: number;
  /** Base particle size in pixels. */
  pointSize?: number;
  /** Base particle color (soft white by default). */
  color?: string;
  /** Subtle crest highlight tint. */
  highlight?: string;
  /** Global opacity multiplier. */
  opacity?: number;
  /** Mouse parallax strength (world units). */
  mouseStrength?: number;
  /** Camera offset on parallax. */
  cameraParallax?: number;
  /** Enable Web Audio reactivity (microphone). */
  audioReactive?: boolean;
  /** Optional audio source (audio element or stream) instead of mic. */
  audioSource?: HTMLMediaElement | MediaStream;
  /** 0..1 — audio response strength (restrained by default). */
  audioSensitivity?: number;
  /** Pauses rendering when the host element scrolls out of view. */
  pauseWhenOffscreen?: boolean;
  /** Optional class on the wrapper div. */
  className?: string;
}

const DEFAULTS = {
  // Lower count + larger spacing prevents clumping now that points are bigger.
  particleCount: 14000,
  size: 26,
  amplitude: 0.9,
  waveSpeed: 0.08,
  turbulence: 0.35,
  // Visible pixels at the reference depth — perspective scales it from there.
  pointSize: 3.2,
  color: '#ffffff',
  highlight: '#dfe7ff',
  // Slightly lower so larger sprites never feel overcrowded.
  opacity: 0.78,
  mouseStrength: 0.35,
  cameraParallax: 0.6,
};

/**
 * Premium procedural particle terrain background.
 *
 * - Fully GPU-driven (BufferGeometry + custom GLSL).
 * - Adaptive particle density for mobile.
 * - Pointer-events disabled — overlay content stays fully interactive.
 * - Pauses rendering when scrolled out of view.
 */
export default function ParticleTerrain(props: ParticleTerrainProps) {
  const {
    particleCount = DEFAULTS.particleCount,
    size = DEFAULTS.size,
    amplitude = DEFAULTS.amplitude,
    waveSpeed = DEFAULTS.waveSpeed,
    turbulence = DEFAULTS.turbulence,
    pointSize = DEFAULTS.pointSize,
    color = DEFAULTS.color,
    highlight = DEFAULTS.highlight,
    opacity = DEFAULTS.opacity,
    mouseStrength = DEFAULTS.mouseStrength,
    cameraParallax = DEFAULTS.cameraParallax,
    audioReactive = false,
    audioSource,
    audioSensitivity = 0.55,
    pauseWhenOffscreen = true,
    className,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Adaptive particle density — fewer points on low-power devices.
  const adaptiveCount = useMemo(() => {
    if (typeof window === 'undefined') return particleCount;
    const w = window.innerWidth;
    const cores = navigator.hardwareConcurrency || 4;
    let factor = 1;
    if (w < 640) factor = 0.35;
    else if (w < 1024) factor = 0.55;
    else if (w < 1440) factor = 0.8;
    if (cores <= 4) factor *= 0.75;
    return Math.max(1200, Math.floor(particleCount * factor));
  }, [particleCount]);

  // Respect prefers-reduced-motion — fade in only, no continuous motion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Pause render loop when the wrapper leaves the viewport.
  useEffect(() => {
    if (!pauseWhenOffscreen || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pauseWhenOffscreen]);

  const audioBandsRef = useAudioAnalyser({
    enabled: audioReactive && !reducedMotion,
    source: audioSource,
    sensitivity: audioSensitivity,
  });

  const frameloop = visible && !reducedMotion ? 'always' : 'demand';

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        camera={{ position: [0, 3.2, 8], fov: 55, near: 0.1, far: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent', display: 'block' }}
      >
        <fog attach="fog" args={['#000000', 10, 24]} />
        <TerrainPoints
          particleCount={adaptiveCount}
          size={size}
          amplitude={amplitude}
          waveSpeed={reducedMotion ? 0 : waveSpeed}
          turbulence={turbulence}
          pointSize={pointSize}
          color={color}
          highlight={highlight}
          opacity={opacity}
          mouseStrength={reducedMotion ? 0 : mouseStrength}
          cameraParallax={reducedMotion ? 0 : cameraParallax}
          audioBandsRef={audioReactive ? audioBandsRef : undefined}
        />
      </Canvas>
    </div>
  );
}
