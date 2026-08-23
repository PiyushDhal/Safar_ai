import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, useTexture, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Convert lat/lng to 3D position vector on sphere of given radius
export function latLngToVector3(lat, lng, radius = 2.2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate curved flight path between 2 vectors
export function createCurvedPath(v1, v2, midHeight = 0.35) {
  const mid = v1.clone().add(v2).multiplyScalar(0.5);
  const distance = v1.distanceTo(v2);
  mid.normalize().multiplyScalar(v1.length() + distance * midHeight);

  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  const points = curve.getPoints(50);
  return { curve, points };
}

const FEATURED_DESTINATIONS = [
  { id: 'delhi', name: 'New Delhi', lat: 28.6139, lng: 77.209, country: 'India', score: 92 },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan', score: 98 },
  { id: 'paris', name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France', score: 95 },
  { id: 'nyc', name: 'New York', lat: 40.7128, lng: -74.006, country: 'USA', score: 94 },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE', score: 96 },
  { id: 'bali', name: 'Bali', lat: -8.3405, lng: 115.092, country: 'Indonesia', score: 93 },
  { id: 'london', name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK', score: 96 },
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia', score: 94 },
];

const FLIGHT_CONNECTIONS = [
  ['delhi', 'dubai'],
  ['delhi', 'tokyo'],
  ['delhi', 'paris'],
  ['delhi', 'bali'],
  ['paris', 'nyc'],
  ['london', 'nyc'],
  ['tokyo', 'sydney'],
  ['dubai', 'london'],
];

/* -------------------------------------------------------------------------- */
/* Custom GLSL Shaders for Photoreal Day/Night & Atmosphere Earth             */
/* -------------------------------------------------------------------------- */

const EarthDayNightShader = {
  uniforms: {
    uDayMap: { value: null },
    uNightMap: { value: null },
    uBumpMap: { value: null },
    uWaterMap: { value: null },
    uSunDirection: { value: new THREE.Vector3(1.5, 0.5, 1.0).normalize() },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(mat3(modelMatrix) * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    uniform sampler2D uBumpMap;
    uniform sampler2D uWaterMap;
    uniform vec3 uSunDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);

      float cosineAngle = dot(normal, sunDir);
      float dayFactor = smoothstep(-0.25, 0.25, cosineAngle);

      vec4 dayColor = texture2D(uDayMap, vUv);
      vec4 nightColor = texture2D(uNightMap, vUv);
      vec4 waterColor = texture2D(uWaterMap, vUv);

      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 reflectDir = reflect(-sunDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * waterColor.r * 0.8;

      vec3 finalColor = mix(nightColor.rgb * 1.9, dayColor.rgb + vec3(spec), dayFactor);

      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      vec3 atmosphereGlow = vec3(0.02, 0.72, 0.96) * pow(rim, 3.5) * 0.65;

      gl_FragColor = vec4(finalColor + atmosphereGlow, 1.0);
    }
  `,
};

const AtmosphereGlowShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
      gl_FragColor = vec4(0.02, 0.72, 0.96, 1.0) * intensity * 0.85;
    }
  `,
};

function FlightPathArc({ start, end, active }) {
  const pathData = useMemo(() => {
    const v1 = latLngToVector3(start.lat, start.lng, 2.2);
    const v2 = latLngToVector3(end.lat, end.lng, 2.2);
    return createCurvedPath(v1, v2, 0.35);
  }, [start, end]);

  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current && pathData.curve) {
      const t = (state.clock.getElapsedTime() * 0.4) % 1;
      const point = pathData.curve.getPoint(t);
      pulseRef.current.position.copy(point);
    }
  });

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(pathData.points);
  }, [pathData]);

  return (
    <group>
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: active ? '#06b6d4' : '#818cf8',
          transparent: true,
          opacity: active ? 0.95 : 0.5,
          linewidth: 2.0,
        })
      )} />

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

function DestinationMarker({ dest, isHovered, onClick, onHover }) {
  const pos = useMemo(() => latLngToVector3(dest.lat, dest.lng, 2.22), [dest]);
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(dest);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(dest);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={isHovered ? '#38bdf8' : '#06b6d4'}
          emissive="#0284c7"
          emissiveIntensity={2.0}
        />
      </mesh>

      <mesh ref={ringRef}>
        <ringGeometry args={[0.065, 0.09, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={isHovered ? 0.95 : 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isHovered && (
        <Html distanceFactor={10} position={[0, 0.2, 0]} center>
          <div className="pointer-events-none rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-md text-white whitespace-nowrap animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              {dest.name} <span className="text-cyan-300 font-normal">({dest.country})</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              Safety Score: <span className="text-emerald-400 font-bold">{dest.score}/100</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Photoreal Earth Mesh Component                                             */
/* -------------------------------------------------------------------------- */

function RealisticEarthMesh({ mouse, hoverState, activeDest, setActiveDest }) {
  const earthGroupRef = useRef();
  const cloudsRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  const [hoveredDest, setHoveredDest] = useState(null);

  const [dayMap, nightMap, bumpMap, waterMap] = useTexture([
    '/textures/earth-day-hi.jpg',
    '/textures/earth-night.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-water.png',
  ]);

  useEffect(() => {
    console.info('[SafarAI Fullscreen Globe] High-res textures loaded successfully.');
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: dayMap },
        uNightMap: { value: nightMap },
        uBumpMap: { value: bumpMap },
        uWaterMap: { value: waterMap },
        uSunDirection: { value: new THREE.Vector3(1.5, 0.5, 1.0).normalize() },
      },
      vertexShader: EarthDayNightShader.vertexShader,
      fragmentShader: EarthDayNightShader.fragmentShader,
    });
  }, [dayMap, nightMap, bumpMap, waterMap]);

  useFrame((state, delta) => {
    if (earthGroupRef.current && !hoveredDest) {
      earthGroupRef.current.rotation.y += delta * 0.07;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.09;
    }

    const speedMultiplier = hoverState.current ? 1.6 : 1.0;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.3 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.5 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.4 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.2 * speedMultiplier;
    }
  });

  return (
    <group ref={earthGroupRef}>
      {/* 3D Photoreal Earth Sphere */}
      <mesh material={shaderMaterial}>
        <sphereGeometry args={[2.2, 64, 64]} />
      </mesh>

      {/* Cloud Shell */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.24, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Rayleigh Atmosphere Outer Glow */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <shaderMaterial
          vertexShader={AtmosphereGlowShader.vertexShader}
          fragmentShader={AtmosphereGlowShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Flight Path Arcs */}
      {FLIGHT_CONNECTIONS.map(([srcId, dstId], idx) => {
        const src = FEATURED_DESTINATIONS.find((d) => d.id === srcId);
        const dst = FEATURED_DESTINATIONS.find((d) => d.id === dstId);
        if (!src || !dst) return null;
        const isActive = hoveredDest?.id === srcId || hoveredDest?.id === dstId;
        return <FlightPathArc key={idx} start={src} end={dst} active={isActive} />;
      })}

      {/* Destination Markers */}
      {FEATURED_DESTINATIONS.map((dest) => (
        <DestinationMarker
          key={dest.id}
          dest={dest}
          isHovered={hoveredDest?.id === dest.id}
          onClick={setActiveDest}
          onHover={setHoveredDest}
        />
      ))}

      {/* Sleek Orbit Ring 1 */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3.5, 0, 0]}>
          <torusGeometry args={[3.1, 0.012, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.65} />
        </mesh>
        <mesh position={[3.1, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Sleek Orbit Ring 2 */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[3.6, 0.01, 16, 100]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.45} />
        </mesh>
        <mesh position={[-3.6, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Space Starfield                                                            */
/* -------------------------------------------------------------------------- */

function SpaceStarfield({ count = 350 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#c084fc'),
    ];

    for (let i = 0; i < count; i++) {
      const r = 4.0 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlobeLoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-950/85 px-6 py-4 shadow-2xl backdrop-blur-xl text-white whitespace-nowrap">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        <span className="text-xs font-extrabold tracking-wider text-cyan-300 uppercase">
          Initializing 3D Global Network...
        </span>
      </div>
    </Html>
  );
}

/* -------------------------------------------------------------------------- */
/* Fullscreen HeroGlobe3D Component                                           */
/* -------------------------------------------------------------------------- */

export default function HeroGlobe3D({ className = '' }) {
  const mouse = useRef({ x: 0, y: 0 });
  const hoverState = useRef(false);
  const [activeDest, setActiveDest] = useState(null);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mouse.current.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / innerHeight) * 2 + 1;
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { hoverState.current = true; }}
      onMouseLeave={() => { hoverState.current = false; mouse.current = { x: 0, y: 0 }; }}
    >
      <Canvas
        camera={{ position: [1.2, 0, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#818cf8" />

        <Suspense fallback={<GlobeLoadingIndicator />}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <RealisticEarthMesh
              mouse={mouse}
              hoverState={hoverState}
              activeDest={activeDest}
              setActiveDest={setActiveDest}
            />
          </Float>
          <SpaceStarfield count={300} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          rotateSpeed={0.5}
          autoRotate={true}
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

useTexture.preload('/textures/earth-day-hi.jpg');
useTexture.preload('/textures/earth-night.jpg');
useTexture.preload('/textures/earth-topology.png');
useTexture.preload('/textures/earth-water.png');
