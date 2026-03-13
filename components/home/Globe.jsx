'use client';
import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ——— Simplified continent check (lat/lng → is land?) ——— */
function isLand(lat, lng) {
  // North America
  if (lat > 25 && lat < 50 && lng > -130 && lng < -60) return true;
  if (lat > 50 && lat < 72 && lng > -170 && lng < -55) return true;
  if (lat > 15 && lat < 30 && lng > -120 && lng < -80) return true;
  // Central America
  if (lat > 7 && lat < 20 && lng > -92 && lng < -77) return true;
  // South America
  if (lat > -56 && lat < 12 && lng > -82 && lng < -34) return true;
  // Europe
  if (lat > 36 && lat < 60 && lng > -10 && lng < 30) return true;
  if (lat > 55 && lat < 71 && lng > 5 && lng < 40) return true;
  // UK/Ireland
  if (lat > 50 && lat < 60 && lng > -11 && lng < 2) return true;
  // Africa
  if (lat > -35 && lat < 37 && lng > -18 && lng < 52) return true;
  // Middle East
  if (lat > 12 && lat < 42 && lng > 30 && lng < 60) return true;
  // India
  if (lat > 8 && lat < 35 && lng > 68 && lng < 90) return true;
  // Southeast Asia
  if (lat > -10 && lat < 28 && lng > 90 && lng < 140) return true;
  // China/East Asia
  if (lat > 20 && lat < 55 && lng > 73 && lng < 135) return true;
  // Japan/Korea
  if (lat > 30 && lat < 46 && lng > 128 && lng < 146) return true;
  // Russia/Siberia
  if (lat > 50 && lat < 75 && lng > 30 && lng < 180) return true;
  // Australia
  if (lat > -40 && lat < -11 && lng > 113 && lng < 154) return true;
  // Indonesia
  if (lat > -8 && lat < 5 && lng > 95 && lng < 141) return true;
  // Greenland
  if (lat > 60 && lat < 84 && lng > -73 && lng < -12) return true;
  return false;
}

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ——— Atmosphere glow shader ——— */
const AtmosphereMaterial = {
  uniforms: {
    glowColor: { value: new THREE.Color('#f5c518') },
    coefficient: { value: 0.6 },
    power: { value: 3.5 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float coefficient;
    uniform float power;
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      float intensity = pow(coefficient + dot(vPositionNormal, vNormal), power);
      gl_FragColor = vec4(glowColor, intensity * 0.6);
    }
  `,
};

/* ——— Generate arc data ——— */
function generateArcs() {
  const routes = [
    { from: [40.7, -74], to: [51.5, -0.1] },     // NYC → London
    { from: [51.5, -0.1], to: [28.6, 77.2] },     // London → Delhi
    { from: [35.7, 139.7], to: [-33.9, 151.2] },   // Tokyo → Sydney
    { from: [40.7, -74], to: [-23.5, -46.6] },     // NYC → São Paulo
    { from: [55.7, 37.6], to: [39.9, 116.4] },     // Moscow → Beijing
    { from: [1.3, 103.8], to: [35.7, 139.7] },     // Singapore → Tokyo
    { from: [-33.9, 18.4], to: [30, 31.2] },       // Cape Town → Cairo
    { from: [48.8, 2.3], to: [25.2, 55.3] },       // Paris → Dubai
    { from: [37.8, -122.4], to: [35.7, 139.7] },   // SF → Tokyo
    { from: [22.3, 114.2], to: [-33.9, 151.2] },   // Hong Kong → Sydney
  ];

  return routes.map(({ from, to }) => {
    const start = latLngToVec3(from[0], from[1], 1.005);
    const end = latLngToVec3(to[0], to[1], 1.005);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.4);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(64);
  });
}

/* ——— Main Globe Mesh ——— */
function GlobeMesh() {
  const groupRef = useRef();
  const arcsRef = useRef();
  const timeRef = useRef(0);

  // Generate continent dots
  const { landPositions, landColors, oceanPositions } = useMemo(() => {
    const land = [];
    const landCol = [];
    const ocean = [];
    const dotDensity = 22000;

    for (let i = 0; i < dotDensity; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotDensity);
      const theta = Math.sqrt(dotDensity * Math.PI) * phi;

      const lat = 90 - (phi * 180) / Math.PI;
      const lng = ((theta * 180) / Math.PI) % 360 - 180;

      const x = 1.002 * Math.cos(theta) * Math.sin(phi);
      const y = 1.002 * Math.sin(theta) * Math.sin(phi);
      const z = 1.002 * Math.cos(phi);

      if (isLand(lat, lng)) {
        land.push(x, y, z);
        // Vary brightness for depth
        const brightness = 0.6 + Math.random() * 0.4;
        landCol.push(0.96 * brightness, 0.77 * brightness, 0.09 * brightness);
      } else {
        // Sparse ocean dots
        if (Math.random() < 0.08) {
          ocean.push(x * 1.001, y * 1.001, z * 1.001);
        }
      }
    }
    return {
      landPositions: new Float32Array(land),
      landColors: new Float32Array(landCol),
      oceanPositions: new Float32Array(ocean),
    };
  }, []);

  // Generate arcs
  const arcs = useMemo(() => generateArcs(), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    timeRef.current += delta;
  });

  return (
    <group ref={groupRef} rotation={[0.3, -0.5, 0.1]}>
      {/* Dark sphere base */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#050505"
          roughness={0.9}
          metalness={0.1}
        />
      </Sphere>

      {/* Subtle wireframe grid */}
      <Sphere args={[1.003, 40, 40]}>
        <meshBasicMaterial
          color="#f5c518"
          transparent
          opacity={0.015}
          wireframe
        />
      </Sphere>

      {/* Land dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={landPositions}
            count={landPositions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={landColors}
            count={landColors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.008}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Sparse ocean dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={oceanPositions}
            count={oceanPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#f5c518"
          size={0.004}
          transparent
          opacity={0.1}
          sizeAttenuation
        />
      </points>

      {/* Shipping route arcs */}
      <group>
        {arcs.map((arcPoints, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array(arcPoints.flatMap(p => [p.x, p.y, p.z]))}
                count={arcPoints.length}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#f5c518"
              transparent
              opacity={0.18}
            />
          </line>
        ))}
      </group>

      {/* Inner atmosphere */}
      <Sphere args={[1.06, 64, 64]}>
        <shaderMaterial
          attach="material"
          args={[{
            uniforms: {
              glowColor: { value: new THREE.Color('#f5c518') },
              coefficient: { value: 0.5 },
              power: { value: 4.0 },
            },
            vertexShader: AtmosphereMaterial.vertexShader,
            fragmentShader: AtmosphereMaterial.fragmentShader,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }]}
        />
      </Sphere>

      {/* Outer glow halo */}
      <Sphere args={[1.25, 64, 64]}>
        <shaderMaterial
          attach="material"
          args={[{
            uniforms: {
              glowColor: { value: new THREE.Color('#f5c518') },
              coefficient: { value: 0.3 },
              power: { value: 5.0 },
            },
            vertexShader: AtmosphereMaterial.vertexShader,
            fragmentShader: AtmosphereMaterial.fragmentShader,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }]}
        />
      </Sphere>

      {/* Route endpoint markers */}
      {[
        [40.7, -74], [51.5, -0.1], [28.6, 77.2], [35.7, 139.7],
        [-33.9, 151.2], [-23.5, -46.6], [55.7, 37.6], [39.9, 116.4],
        [1.3, 103.8], [-33.9, 18.4], [30, 31.2], [48.8, 2.3],
        [25.2, 55.3], [37.8, -122.4], [22.3, 114.2],
      ].map(([lat, lng], i) => {
        const pos = latLngToVec3(lat, lng, 1.01);
        return (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#f5c518" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Globe() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 3, 5]} intensity={0.4} color="#f5c518" />
        <directionalLight position={[-3, -2, -3]} intensity={0.1} color="#ffffff" />
        <pointLight position={[2, 1, 3]} intensity={0.3} color="#f5c518" />
        <GlobeMesh />
      </Canvas>
    </div>
  );
}
