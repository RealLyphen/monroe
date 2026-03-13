'use client';
import { useEffect, useRef } from 'react';

/* ── Concentric animated rings — WebGL shader component ── */
export default function RingsBackground({ blur = 0 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId;
    let renderer, scene, camera, material;
    let burstRef = { current: 0 };
    let hoverAmountRef = { current: 0 };
    let smoothMouseRef = { current: [0, 0] };
    let rawMouse = [0, 0];

    const p = {
      speed: 0.4,
      attenuation: 1.5,
      color: '#f5c518',
      colorTwo: '#d4a800',
      lineThickness: 1.2,
      baseRadius: 0.18,
      radiusStep: 0.07,
      scaleRate: 0.6,
      ringCount: 6,
      opacity: 0.55,
      noiseAmount: 0.08,
      rotation: 0,
      ringGap: 0.0,
      fadeIn: 0.18,
      fadeOut: 0.85,
      followMouse: true,
      mouseInfluence: 0.12,
      hoverScale: 1.06,
      parallax: 0.04,
      clickBurst: false,
    };

    /* Lazy-import three.js so it only loads client-side */
    import('three').then((THREE) => {
      const W = mount.clientWidth || 600;
      const H = mount.clientHeight || 400;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const uniforms = {
        uTime:           { value: 0 },
        uResolution:     { value: new THREE.Vector2(W, H) },
        uAttenuation:    { value: p.attenuation },
        uColor:          { value: new THREE.Color(p.color) },
        uColorTwo:       { value: new THREE.Color(p.colorTwo) },
        uLineThickness:  { value: p.lineThickness },
        uBaseRadius:     { value: p.baseRadius },
        uRadiusStep:     { value: p.radiusStep },
        uScaleRate:      { value: p.scaleRate },
        uRingCount:      { value: p.ringCount },
        uOpacity:        { value: p.opacity },
        uNoiseAmount:    { value: p.noiseAmount },
        uRotation:       { value: 0 },
        uRingGap:        { value: p.ringGap },
        uFadeIn:         { value: p.fadeIn },
        uFadeOut:        { value: p.fadeOut },
        uMouse:          { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: 0 },
        uHoverAmount:    { value: 0 },
        uHoverScale:     { value: p.hoverScale },
        uParallax:       { value: p.parallax },
        uBurst:          { value: 0 },
      };

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uTime;
        uniform vec2  uResolution;
        uniform float uAttenuation;
        uniform vec3  uColor;
        uniform vec3  uColorTwo;
        uniform float uLineThickness;
        uniform float uBaseRadius;
        uniform float uRadiusStep;
        uniform float uScaleRate;
        uniform float uRingCount;
        uniform float uOpacity;
        uniform float uNoiseAmount;
        uniform float uRotation;
        uniform float uRingGap;
        uniform float uFadeIn;
        uniform float uFadeOut;
        uniform vec2  uMouse;
        uniform float uMouseInfluence;
        uniform float uHoverAmount;
        uniform float uHoverScale;
        uniform float uParallax;
        uniform float uBurst;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1));
          float d = hash(i + vec2(1,1));
          return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
        }

        void main() {
          vec2 uv = vUv - 0.5;
          float aspect = uResolution.x / uResolution.y;
          uv.x *= aspect;

          /* parallax */
          uv += uMouse * uParallax;

          /* mouse influence */
          uv -= uMouse * uMouseInfluence;

          /* rotation */
          float cosR = cos(uRotation);
          float sinR = sin(uRotation);
          uv = vec2(cosR * uv.x - sinR * uv.y, sinR * uv.x + cosR * uv.y);

          /* hover scale */
          float scale = 1.0 + uHoverAmount * (uHoverScale - 1.0);
          uv /= scale;

          float dist = length(uv);
          float angle = atan(uv.y, uv.x);

          float totalAlpha = 0.0;
          vec3  totalColor = vec3(0.0);

          for (float i = 0.0; i < 12.0; i++) {
            if (i >= uRingCount) break;

            float t = uTime * uScaleRate + i * uRadiusStep;
            float radius = uBaseRadius + mod(t, uRadiusStep * uRingCount)
                           + i * uRingGap;

            /* per-ring noise warp */
            float n = noise(uv * 4.0 + uTime * 0.3 + i * 1.7) * uNoiseAmount;
            float d = abs(dist - radius + n);

            float thickness = uLineThickness * 0.002;
            float ring = smoothstep(thickness, 0.0, d);

            /* radial fade */
            float fade = smoothstep(0.0, uFadeIn, dist) * (1.0 - smoothstep(uFadeOut, 1.0, dist));
            ring *= fade;

            /* burst */
            ring *= 1.0 + uBurst * 2.0;

            /* colour mix */
            float t01 = i / max(uRingCount - 1.0, 1.0);
            vec3 col = mix(uColor, uColorTwo, t01);

            totalAlpha += ring * uOpacity;
            totalColor += col * ring * uOpacity;
          }

          totalAlpha = clamp(totalAlpha, 0.0, 1.0);
          vec3 finalColor = totalAlpha > 0.001
            ? totalColor / totalAlpha
            : uColor;

          gl_FragColor = vec4(finalColor, totalAlpha);
        }
      `;

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });

      const geo = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geo, material));

      /* resize */
      const ro = new ResizeObserver(() => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        renderer.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
      });
      ro.observe(mount);

      const resize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        renderer.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
      };
      window.addEventListener('resize', resize);

      /* mouse */
      const onMouseMove = (e) => {
        const rect = mount.getBoundingClientRect();
        rawMouse = [
          ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          -((e.clientY - rect.top) / rect.height - 0.5) * 2,
        ];
      };
      const onMouseEnter = () => {
        hoverAmountRef.current = 1;
      };
      const onMouseLeave = () => {
        hoverAmountRef.current = 0;
        rawMouse = [0, 0];
      };
      mount.addEventListener('mousemove', onMouseMove);
      mount.addEventListener('mouseenter', onMouseEnter);
      mount.addEventListener('mouseleave', onMouseLeave);

      /* animate */
      const animate = (t) => {
        /* smooth mouse */
        smoothMouseRef.current[0] += (rawMouse[0] - smoothMouseRef.current[0]) * 0.08;
        smoothMouseRef.current[1] += (rawMouse[1] - smoothMouseRef.current[1]) * 0.08;

        uniforms.uTime.value = t * 0.001 * p.speed;
        uniforms.uAttenuation.value = p.attenuation;
        uniforms.uColor.value.set(p.color);
        uniforms.uColorTwo.value.set(p.colorTwo);
        uniforms.uLineThickness.value = p.lineThickness;
        uniforms.uBaseRadius.value = p.baseRadius;
        uniforms.uRadiusStep.value = p.radiusStep;
        uniforms.uScaleRate.value = p.scaleRate;
        uniforms.uRingCount.value = p.ringCount;
        uniforms.uOpacity.value = p.opacity;
        uniforms.uNoiseAmount.value = p.noiseAmount;
        uniforms.uRotation.value = (p.rotation * Math.PI) / 180;
        uniforms.uRingGap.value = p.ringGap;
        uniforms.uFadeIn.value = p.fadeIn;
        uniforms.uFadeOut.value = p.fadeOut;
        uniforms.uMouse.value.set(smoothMouseRef.current[0], smoothMouseRef.current[1]);
        uniforms.uMouseInfluence.value = p.followMouse ? p.mouseInfluence : 0;
        uniforms.uHoverAmount.value = hoverAmountRef.current;
        uniforms.uHoverScale.value = p.hoverScale;
        uniforms.uParallax.value = p.parallax;
        uniforms.uBurst.value = p.clickBurst ? burstRef.current : 0;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (renderer) {
        window.removeEventListener('resize', () => {});
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      if (material) material.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={blur > 0 ? { filter: `blur(${blur}px)`, width: '100%', height: '100%' } : { width: '100%', height: '100%' }}
    />
  );
}
