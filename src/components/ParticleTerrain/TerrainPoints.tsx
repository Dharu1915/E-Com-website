import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { terrainFragment } from './shaders/terrain.frag';
import { terrainVertex } from './shaders/terrain.vert';
import type { AudioBands } from './useAudioAnalyser';

export interface TerrainPointsProps {
  /** Approximate particle count target. Actual count is clamped to a perfect grid. */
  particleCount: number;
  /** World size of the terrain plane (X and Z extents). */
  size: number;
  /** Base wave amplitude. */
  amplitude: number;
  /** Terrain drift speed. */
  waveSpeed: number;
  /** High-octave detail strength. */
  turbulence: number;
  /** Base point size in pixels (pre-DPR). */
  pointSize: number;
  /** Particle base color. */
  color: string;
  /** Subtle crest highlight color. */
  highlight: string;
  /** Final material opacity. */
  opacity: number;
  /** Mouse parallax strength (world units). */
  mouseStrength: number;
  /** Camera parallax in world units (X/Y influence). */
  cameraParallax: number;
  /** Optional smoothed audio bands ref. */
  audioBandsRef?: React.MutableRefObject<AudioBands>;
}

export default function TerrainPoints({
  particleCount,
  size,
  amplitude,
  waveSpeed,
  turbulence,
  pointSize,
  color,
  highlight,
  opacity,
  mouseStrength,
  cameraParallax,
  audioBandsRef,
}: TerrainPointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseSmoothed = useRef(new THREE.Vector2(0, 0));
  const cameraTarget = useRef(new THREE.Vector3(0, 3.2, 8));
  const { camera, gl, size: viewport } = useThree();

  // Build a square grid of points (no CPU animation — all done in vertex shader).
  const geometry = useMemo(() => {
    const side = Math.max(2, Math.floor(Math.sqrt(particleCount)));
    const count = side * side;
    const positions = new Float32Array(count * 3);
    const half = size / 2;
    const step = size / (side - 1);

    for (let i = 0; i < side; i++) {
      for (let j = 0; j < side; j++) {
        const idx = (i * side + j) * 3;
        positions[idx] = -half + j * step;
        positions[idx + 1] = 0;
        positions[idx + 2] = -half + i * step;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), size);
    return geo;
  }, [particleCount, size]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: amplitude },
      uWaveSpeed: { value: waveSpeed },
      uTurbulence: { value: turbulence },
      uPointSize: { value: pointSize },
      uSparkle: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.5) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: mouseStrength },
      uColor: { value: new THREE.Color(color) },
      uHighlight: { value: new THREE.Color(highlight) },
      uOpacity: { value: opacity },
    }),
    // Intentionally omit reactive fields — we sync them via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gl],
  );

  // Sync prop changes into existing uniforms without recreating the material.
  useEffect(() => {
    uniforms.uAmplitude.value = amplitude;
    uniforms.uWaveSpeed.value = waveSpeed;
    uniforms.uTurbulence.value = turbulence;
    uniforms.uPointSize.value = pointSize;
    uniforms.uMouseStrength.value = mouseStrength;
    uniforms.uOpacity.value = opacity;
    uniforms.uColor.value.set(color);
    uniforms.uHighlight.value.set(highlight);
  }, [
    amplitude,
    waveSpeed,
    turbulence,
    pointSize,
    mouseStrength,
    opacity,
    color,
    highlight,
    uniforms,
  ]);

  useEffect(() => {
    uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
  }, [gl, viewport.width, viewport.height, uniforms]);

  // Window-level pointer tracking — works regardless of canvas pointer-events.
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseTarget.current.set(x, y);
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  // Dispose GPU resources on unmount — no memory leaks.
  useEffect(() => {
    return () => {
      geometry.dispose();
      materialRef.current?.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const u = uniforms;
    u.uTime.value += clampedDelta;

    // Smooth mouse interpolation — silky parallax.
    mouseSmoothed.current.lerp(mouseTarget.current, 0.06);
    u.uMouse.value.copy(mouseSmoothed.current);

    // Audio reactivity — restrained, with smooth lerp toward modulated targets.
    const bands = audioBandsRef?.current;
    if (bands) {
      const ampTarget = amplitude * (1 + bands.bass * 0.45);
      const turbTarget = turbulence * (1 + bands.mid * 0.5);
      const sparkleTarget = bands.high * 0.9;
      u.uAmplitude.value += (ampTarget - u.uAmplitude.value) * 0.08;
      u.uTurbulence.value += (turbTarget - u.uTurbulence.value) * 0.08;
      u.uSparkle.value += (sparkleTarget - u.uSparkle.value) * 0.12;
    } else {
      u.uSparkle.value += (0 - u.uSparkle.value) * 0.1;
    }

    // Cinematic camera parallax — soft lerp toward mouse-offset rest pose.
    cameraTarget.current.set(
      mouseSmoothed.current.x * cameraParallax,
      3.2 + mouseSmoothed.current.y * cameraParallax * 0.4,
      8,
    );
    camera.position.lerp(cameraTarget.current, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={terrainVertex}
        fragmentShader={terrainFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
