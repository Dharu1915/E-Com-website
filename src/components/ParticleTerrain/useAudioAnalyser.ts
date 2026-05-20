import { useEffect, useRef } from 'react';

export interface AudioBands {
  bass: number;
  mid: number;
  high: number;
}

interface UseAudioAnalyserOptions {
  enabled: boolean;
  /** Microphone or HTMLMediaElement source. If omitted and enabled, uses mic. */
  source?: HTMLMediaElement | MediaStream;
  /** 0..1 — how aggressively bands react. Subtle by default. */
  sensitivity?: number;
  /** Smoothing factor (Web Audio default 0.8). Higher = silkier. */
  smoothing?: number;
}

/**
 * Lightweight, restrained audio reactivity.
 * - Exposes bass/mid/high through a ref (no re-renders).
 * - Fully optional; no Web Audio context is created when `enabled` is false.
 * - Cleans up nodes, streams, and AudioContext on unmount.
 */
export function useAudioAnalyser({
  enabled,
  source,
  sensitivity = 0.6,
  smoothing = 0.86,
}: UseAudioAnalyserOptions) {
  const bandsRef = useRef<AudioBands>({ bass: 0, mid: 0, high: 0 });
  const internalRef = useRef<{
    ctx?: AudioContext;
    analyser?: AnalyserNode;
    data?: Uint8Array;
    stream?: MediaStream;
    raf?: number;
  }>({});

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const internal = internalRef.current;

    const setup = async () => {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        const ctx: AudioContext = new AC();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = smoothing;

        let node: AudioNode;
        if (source instanceof HTMLMediaElement) {
          node = ctx.createMediaElementSource(source);
          node.connect(ctx.destination);
        } else if (source instanceof MediaStream) {
          node = ctx.createMediaStreamSource(source);
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            await ctx.close();
            return;
          }
          internal.stream = stream;
          node = ctx.createMediaStreamSource(stream);
        }

        node.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        internal.ctx = ctx;
        internal.analyser = analyser;
        internal.data = data;

        const tick = () => {
          if (!internal.analyser || !internal.data) return;
          internal.analyser.getByteFrequencyData(internal.data);
          const bins = internal.data;
          const len = bins.length;

          // Split spectrum into bass / mid / high.
          const bassEnd = Math.floor(len * 0.08);
          const midEnd = Math.floor(len * 0.35);

          let bassSum = 0;
          let midSum = 0;
          let highSum = 0;

          for (let i = 0; i < bassEnd; i++) bassSum += bins[i];
          for (let i = bassEnd; i < midEnd; i++) midSum += bins[i];
          for (let i = midEnd; i < len; i++) highSum += bins[i];

          const bass = (bassSum / Math.max(bassEnd, 1)) / 255;
          const mid = (midSum / Math.max(midEnd - bassEnd, 1)) / 255;
          const high = (highSum / Math.max(len - midEnd, 1)) / 255;

          // Smooth lerp toward new values; sensitivity is restrained on purpose.
          const cur = bandsRef.current;
          const k = 0.18;
          cur.bass = cur.bass + (bass * sensitivity - cur.bass) * k;
          cur.mid = cur.mid + (mid * sensitivity - cur.mid) * k;
          cur.high = cur.high + (high * sensitivity - cur.high) * k;

          internal.raf = requestAnimationFrame(tick);
        };
        internal.raf = requestAnimationFrame(tick);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[ParticleTerrain] Audio analyser disabled:', err);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (internal.raf) cancelAnimationFrame(internal.raf);
      internal.stream?.getTracks().forEach((t) => t.stop());
      internal.ctx?.close().catch(() => {});
      internalRef.current = {};
      bandsRef.current = { bass: 0, mid: 0, high: 0 };
    };
  }, [enabled, source, sensitivity, smoothing]);

  return bandsRef;
}
