import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Convert lat/lng to 3D position vector on sphere of given radius
export function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate curved flight path between 2 vectors
export function createCurvedPath(v1, v2, midHeight = 0.5) {
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

function FlightPathArc({ start, end, active }) {
  const pathData = useMemo(() => {
    const v1 = latLngToVector3(start.lat, start.lng, 2);
    const v2 = latLngToVector3(end.lat, end.lng, 2);
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
      {/* Curved Arc Line */}
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: active ? '#06b6d4' : '#818cf8',
          transparent: true,
          opacity: active ? 0.85 : 0.4,
          linewidth: 1.5,
        })
      )} />

      {/* Travelling Energy Light Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

function DestinationMarker({ dest, isHovered, isSelected, onClick, onHover }) {
  const pos = useMemo(() => latLngToVector3(dest.lat, dest.lng, 2.02), [dest]);
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group position={pos}>
      {/* 3D Marker Point */}
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
        <sphereGeometry args={[isSelected ? 0.07 : 0.045, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#ec4899' : isHovered ? '#38bdf8' : '#06b6d4'}
          emissive={isSelected ? '#f43f5e' : '#0284c7'}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Pulsing Aura Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.06, 0.085, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#ec4899' : '#06b6d4'}
          transparent
          opacity={isHovered || isSelected ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Label on Hover or Select */}
      {(isHovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.18, 0]} center>
          <div className="pointer-events-none rounded-xl border border-cyan-500/30 bg-slate-950/85 px-3 py-1.5 shadow-2xl backdrop-blur-md text-white whitespace-nowrap animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              {dest.name} <span className="text-cyan-300/80 font-normal">({dest.country})</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Safety Score: <span className="text-emerald-400 font-bold">{dest.score}/100</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function EarthGlobe({ selectedDest, hoveredDest, onSelectDest, onHoverDest }) {
  const globeGroupRef = useRef();

  useFrame((state, delta) => {
    if (globeGroupRef.current && !selectedDest && !hoveredDest) {
      globeGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Base Earth Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#0b1329"
          emissive="#061838"
          emissiveIntensity={0.6}
          specular="#38bdf8"
          shininess={25}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe Grid Layer */}
      <Sphere args={[2.008, 48, 48]}>
        <meshBasicMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.35}
        />
      </Sphere>

      {/* Atmosphere Glow Outer Shell */}
      <Sphere args={[2.15, 64, 64]}>
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Flight Path Arcs */}
      {FLIGHT_CONNECTIONS.map(([srcId, dstId], idx) => {
        const src = FEATURED_DESTINATIONS.find((d) => d.id === srcId);
        const dst = FEATURED_DESTINATIONS.find((d) => d.id === dstId);
        if (!src || !dst) return null;
        const isActive =
          selectedDest?.id === srcId ||
          selectedDest?.id === dstId ||
          hoveredDest?.id === srcId ||
          hoveredDest?.id === dstId;
        return <FlightPathArc key={idx} start={src} end={dst} active={isActive} />;
      })}

      {/* Destination Markers */}
      {FEATURED_DESTINATIONS.map((dest) => (
        <DestinationMarker
          key={dest.id}
          dest={dest}
          isHovered={hoveredDest?.id === dest.id}
          isSelected={selectedDest?.id === dest.id}
          onClick={onSelectDest}
          onHover={onHoverDest}
        />
      ))}
    </group>
  );
}

export default function CinematicGlobe3D({ className = '' }) {
  const [selectedDest, setSelectedDest] = useState(null);
  const [hoveredDest, setHoveredDest] = useState(null);

  return (
    <div className={`relative w-full h-full min-h-[480px] sm:min-h-[580px] overflow-hidden ${className}`}>
      {/* Subtle overlay HUD info */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-950/70 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live Global Intelligence Map
        </div>
        {selectedDest && (
          <div className="mt-2 pointer-events-auto rounded-2xl border border-line bg-slate-950/80 p-3.5 shadow-2xl backdrop-blur-lg animate-slide-right text-white max-w-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-white">{selectedDest.name}</span>
              <span className="text-2xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 px-2 py-0.5">
                {selectedDest.country}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Optimal AI travel window identified. Safety score {selectedDest.score}/100.
            </p>
            <button
              onClick={() => setSelectedDest(null)}
              className="mt-2 text-2xs font-bold text-cyan-400 hover:underline"
            >
              Reset view
            </button>
          </div>
        )}
      </div>

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.8} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#a855f7" />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />

        <EarthGlobe
          selectedDest={selectedDest}
          hoveredDest={hoveredDest}
          onSelectDest={setSelectedDest}
          onHoverDest={setHoveredDest}
        />

        <OrbitControls
          enableZoom={true}
          minDistance={3.5}
          maxDistance={8}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          autoRotate={!selectedDest && !hoveredDest}
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
