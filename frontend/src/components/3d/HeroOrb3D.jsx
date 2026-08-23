import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial, Trail, Ring } from '@react-three/drei';
import * as THREE from 'three';

function InnerCore({ mouse, hoverState }) {
  const meshRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Lerp rotation based on mouse offset
    const targetX = (mouse.current.y * 0.5);
    const targetY = (mouse.current.x * 0.5);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX + state.clock.getElapsedTime() * 0.2, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY + state.clock.getElapsedTime() * 0.3, 0.05);

    // Rotate Orbital Rings at different speeds & axes
    const speedMultiplier = hoverState.current ? 2.2 : 1.0;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.6 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.8 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.7 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.5 * speedMultiplier;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.9 * speedMultiplier;
      ring3Ref.current.rotation.z -= delta * 0.4 * speedMultiplier;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central Glowing AI Orb */}
      <Sphere args={[1.4, 64, 64]} scale={1}>
        <MeshDistortMaterial
          color="#06b6d4"
          emissive="#6366f1"
          emissiveIntensity={hoverState.current ? 1.8 : 1.2}
          roughness={0.1}
          metalness={0.8}
          distort={0.45}
          speed={3.5}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe Hologram Layer */}
      <Sphere args={[1.48, 32, 32]}>
        <meshStandardMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.35}
        />
      </Sphere>

      {/* Inner Energy Core */}
      <Sphere args={[0.9, 32, 32]}>
        <meshBasicMaterial color="#ec4899" transparent opacity={0.8} />
      </Sphere>

      {/* Outer Orbital Ring 1 */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.2, 0.018, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
        <mesh position={[2.2, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Outer Orbital Ring 2 */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[2.6, 0.015, 16, 100]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.7} />
        </mesh>
        <mesh position={[-2.6, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      </group>

      {/* Outer Orbital Ring 3 */}
      <group ref={ring3Ref}>
        <mesh rotation={[0, Math.PI / 3, Math.PI / 6]}>
          <torusGeometry args={[3.0, 0.012, 16, 100]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function ParticleField({ count = 250 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#38bdf8'),
    ];

    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 3.5;
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
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x += delta * 0.03;
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

export default function HeroOrb3D({ className = '' }) {
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
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#a855f7" />
        <directionalLight position={[0, 5, 5]} intensity={1} color="#ffffff" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <InnerCore mouse={mouse} hoverState={hoverState} />
        </Float>
        <ParticleField count={220} />
      </Canvas>
    </div>
  );
}
