// Fragment shader: soft circular point sprite, near-monochrome palette,
// subtle elevation-driven luminance and depth atmospheric fade.

export const terrainFragment = /* glsl */ `
precision highp float;

uniform vec3  uColor;        // base particle color (soft white)
uniform vec3  uHighlight;    // crest highlight (very subtle warm/cool tint)
uniform float uOpacity;

varying float vElevation;
varying float vDepthFade;
varying float vSparkle;

void main() {
  // Polar coords inside the point sprite.
  vec2 uv = gl_PointCoord - 0.5;
  float d2 = dot(uv, uv);
  if (d2 > 0.25) discard;             // outside unit disk

  // Cinematic two-stage falloff:
  //   - gaussian core gives a bright, glowing inner node
  //   - soft outer halo dissolves the edge so points never look like hard dots
  float core = exp(-d2 * 14.0);
  float d = sqrt(d2);
  float halo = smoothstep(0.5, 0.12, d);
  float alpha = max(core, halo * 0.45);

  // Crest-driven luminance: higher terrain = subtly brighter.
  float crest = smoothstep(-0.2, 0.9, vElevation);

  vec3 color = mix(uColor * 0.55, uColor, crest);
  color = mix(color, uHighlight, crest * 0.4 + vSparkle * 0.25);

  // Restrained inner highlight — premium glow without bloom.
  color += core * 0.18;

  // Depth attenuation also drives opacity — far points thin out instead of stacking.
  float finalAlpha = alpha * uOpacity * vDepthFade;
  if (finalAlpha < 0.003) discard;
  gl_FragColor = vec4(color, finalAlpha);

  #include <colorspace_fragment>
}
`;
