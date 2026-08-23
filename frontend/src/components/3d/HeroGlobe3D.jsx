import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

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

      // Diffuse lighting factor
      float cosineAngle = dot(normal, sunDir);
      float dayFactor = smoothstep(-0.25, 0.25, cosineAngle);

      // Sample texture maps
      vec4 dayColor = texture2D(uDayMap, vUv);
      vec4 nightColor = texture2D(uNightMap, vUv);
      vec4 waterColor = texture2D(uWaterMap, vUv);

      // Specular highlight on ocean water
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 reflectDir = reflect(-sunDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * waterColor.r * 0.8;

      // Mix day and night colors based on sun angle
      vec3 finalColor = mix(nightColor.rgb * 1.8, dayColor.rgb + vec3(spec), dayFactor);

      // Atmosphere rim glow tint
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

/* -------------------------------------------------------------------------- */
/* Photoreal Earth Sphere Mesh                                               */
/* -------------------------------------------------------------------------- */

function RealisticEarthMesh({ mouse, hoverState }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  // Load high-resolution textures from public/textures/
  const [dayMap, nightMap, bumpMap, waterMap] = useTexture([
    '/textures/earth-day-hi.jpg',
    '/textures/earth-night.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-water.png',
  ]);

  useEffect(() => {
    console.info('[SafarAI 3D Globe] Earth textures loaded successfully:', {
      dayMap: dayMap?.image ? 'OK' : 'FAIL',
      nightMap: nightMap?.image ? 'OK' : 'FAIL',
      bumpMap: bumpMap?.image ? 'OK' : 'FAIL',
      waterMap: waterMap?.image ? 'OK' : 'FAIL',
    });
  }, [dayMap, nightMap, bumpMap, waterMap]);

  // Create custom shader material with loaded textures
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
    if (earthRef.current) {
      // Rotate Earth on axis
      earthRef.current.rotation.y += delta * 0.06;

      // Mouse interactive tilt lerp
      const targetX = mouse.current.y * 0.35;
      const targetY = mouse.current.x * 0.35;
      earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetX, 0.05);
      earthRef.current.rotation.z = THREE.MathUtils.lerp(earthRef.current.rotation.z, -targetY, 0.05);
    }

    if (cloudsRef.current) {
      // Clouds rotate slightly faster
      cloudsRef.current.rotation.y += delta * 0.08;
    }

    const speedMultiplier = hoverState.current ? 1.8 : 1.0;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.4 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.6 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.5 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.3 * speedMultiplier;
    }
  });

  return (
    <group>
      {/* 3D Photoreal Earth Sphere */}
      <group ref={earthRef}>
        <mesh material={shaderMaterial}>
          <sphereGeometry args={[1.65, 64, 64]} />
        </mesh>

        {/* Semi-transparent Atmosphere Cloud Shell */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.68, 64, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Rayleigh Atmosphere Outer Glow Shell */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[1.65, 64, 64]} />
        <shaderMaterial
          vertexShader={AtmosphereGlowShader.vertexShader}
          fragmentShader={AtmosphereGlowShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Sleek Orbit Ring 1 */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3.5, 0, 0]}>
          <torusGeometry args={[2.35, 0.012, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.65} />
        </mesh>
        <mesh position={[2.35, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Sleek Orbit Ring 2 */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[2.75, 0.01, 16, 100]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.45} />
        </mesh>
        <mesh position={[-2.75, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Floating Star & Space Dust Field                                           */
/* -------------------------------------------------------------------------- */

function SpaceDustField({ count = 280 }) {
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
      const r = 2.8 + Math.random() * 3.5;
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
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.02;
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
        size={0.055}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading Fallback Component (Replaces procedural blob)                     */
/* -------------------------------------------------------------------------- */

function GlobeLoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-6 py-4 shadow-2xl backdrop-blur-xl text-white whitespace-nowrap">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
          Initializing 3D Earth Globe...
        </span>
      </div>
    </Html>
  );
}

/* -------------------------------------------------------------------------- */
/* Main HeroGlobe3D Component                                                 */
/* -------------------------------------------------------------------------- */

export default function HeroGlobe3D({ className = '' }) {
  const mouse = useRef({ x: 0, y: 0 });
  const hoverState = useRef(false);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mouse.current.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / innerHeight) * 2 + 1;
  };

  return (
    <div
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { hoverState.current = true; }}
      onMouseLeave={() => { hoverState.current = false; mouse.current = { x: 0, y: 0 }; }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#818cf8" />

        <Suspense fallback={<GlobeLoadingIndicator />}>
          <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
            <RealisticEarthMesh mouse={mouse} hoverState={hoverState} />
          </Float>
          <SpaceDustField count={250} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload Earth texture maps for instant rendering
useTexture.preload('/textures/earth-day-hi.jpg');
useTexture.preload('/textures/earth-night.jpg');
useTexture.preload('/textures/earth-topology.png');
useTexture.preload('/textures/earth-water.png');
