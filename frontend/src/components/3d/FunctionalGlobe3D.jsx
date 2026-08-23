import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, useTexture, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTravelOS } from '../../context/TravelOSContext';

export function latLngToVector3(lat, lng, radius = 2.4) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const CITIES_COORDS = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
};

function RouteBezierLine({ startLat, startLng, endLat, endLng, active }) {
  const pathData = useMemo(() => {
    const v1 = latLngToVector3(startLat, startLng, 2.4);
    const v2 = latLngToVector3(endLat, endLng, 2.4);
    const mid = v1.clone().add(v2).multiplyScalar(0.5);
    const distance = v1.distanceTo(v2);
    mid.normalize().multiplyScalar(v1.length() + distance * 0.35);

    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = curve.getPoints(50);
    return { curve, points };
  }, [startLat, startLng, endLat, endLng]);

  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current && pathData.curve) {
      const t = (state.clock.getElapsedTime() * 0.5) % 1;
      const point = pathData.curve.getPoint(t);
      pulseRef.current.position.copy(point);
    }
  });

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(pathData.points);
  }, [pathData]);

  return (
    <group>
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: active ? '#06b6d4' : '#818cf8',
              transparent: true,
              opacity: active ? 0.95 : 0.4,
              linewidth: 2.5,
            })
          )
        }
      />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

function CandidatePin({ dest, isWinner, isAnalyzing, onClick }) {
  const lat = dest.coordinates?.[1] || dest.lat || 15.2993;
  const lng = dest.coordinates?.[0] || dest.lng || 74.124;
  const pos = useMemo(() => latLngToVector3(lat, lng, 2.42), [lat, lng]);
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isAnalyzing ? 4.0 : 1.5);
    }
  });

  return (
    <group position={pos}>
      <mesh onClick={() => onClick(dest)}>
        <sphereGeometry args={[isWinner ? 0.075 : 0.05, 16, 16]} />
        <meshStandardMaterial
          color={isWinner ? '#ec4899' : '#06b6d4'}
          emissive={isWinner ? '#f43f5e' : '#0284c7'}
          emissiveIntensity={isWinner ? 2.5 : 1.2}
        />
      </mesh>

      <mesh ref={ringRef}>
        <ringGeometry args={[0.07, 0.1, 32]} />
        <meshBasicMaterial
          color={isWinner ? '#ec4899' : '#06b6d4'}
          transparent
          opacity={isWinner ? 0.95 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html distanceFactor={10} position={[0, 0.2, 0]} center>
        <div className="pointer-events-none rounded-xl border border-cyan-500/40 bg-slate-950/90 px-2.5 py-1 text-white whitespace-nowrap shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-black">
            {isWinner && <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />}
            {dest.name}
            {dest.intel?.overallScore && (
              <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-2xs font-bold text-cyan-300">
                {dest.intel.overallScore}pt
              </span>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

function EarthGlobeMesh() {
  const earthGroupRef = useRef();
  const { intent, activeDestination, rankedDestinations, isAnalyzing, selectDestination } = useTravelOS();

  const [dayMap, nightMap, bumpMap, waterMap] = useTexture([
    '/textures/earth-day-hi.jpg',
    '/textures/earth-night.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-water.png',
  ]);

  const departureCoords = CITIES_COORDS[intent.departure] || CITIES_COORDS.Delhi;
  const candidates = rankedDestinations.slice(0, 6);

  useFrame((state, delta) => {
    if (earthGroupRef.current) {
      const speed = isAnalyzing ? delta * 0.45 : delta * 0.08;
      earthGroupRef.current.rotation.y += speed;
    }
  });

  return (
    <group ref={earthGroupRef}>
      <Sphere args={[2.4, 64, 64]}>
        <meshStandardMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughnessMap={waterMap}
          roughness={0.35}
          metalness={0.15}
        />
      </Sphere>

      <Sphere args={[2.55, 64, 64]}>
        <meshBasicMaterial color="#0284c7" transparent opacity={0.16} side={THREE.BackSide} />
      </Sphere>

      {/* Candidate Pins */}
      {candidates.map((dest) => (
        <CandidatePin
          key={dest.slug || dest.id}
          dest={dest}
          isWinner={activeDestination?.slug === dest.slug}
          isAnalyzing={isAnalyzing}
          onClick={selectDestination}
        />
      ))}

      {/* Route Animation Line to Active Recommended Destination */}
      {activeDestination && (
        <RouteBezierLine
          startLat={departureCoords.lat}
          startLng={departureCoords.lng}
          endLat={activeDestination.coordinates?.[1] || activeDestination.lat || 15.2993}
          endLng={activeDestination.coordinates?.[0] || activeDestination.lng || 74.124}
          active={true}
        />
      )}
    </group>
  );
}

function GlobeFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-cyan-500/30 bg-slate-950/90 px-5 py-3 text-white backdrop-blur-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        <span className="text-2xs font-bold uppercase tracking-wider text-cyan-300">
          Loading 3D Earth Telemetry...
        </span>
      </div>
    </Html>
  );
}

export default function FunctionalGlobe3D({ className = '' }) {
  return (
    <div className={`relative w-full h-full min-h-[480px] overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />

        <Suspense fallback={<GlobeFallback />}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
            <EarthGlobeMesh />
          </Float>
        </Suspense>

        <OrbitControls
          enableZoom={true}
          minDistance={3.5}
          maxDistance={7.0}
          rotateSpeed={0.6}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
