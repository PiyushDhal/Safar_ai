import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { latLngToVector3 } from './geo';

const CITIES = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Goa: { lat: 15.2993, lng: 74.124 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Paris: { lat: 48.8566, lng: 2.3522 },
};

/**
 * TravelMarkerOverlay — a lightweight, non-destructive 🚀 / ✈️ travel marker
 * that projects 3D Bezier flight paths to screen-space HTML coordinates.
 */
export default function TravelMarkerOverlay({ globeRef, activeDestination }) {
  const [markerPos, setMarkerPos] = useState(null);
  const [angle, setAngle] = useState(0);
  const animRef = useRef({ progress: 0, lastTime: performance.now() });

  useEffect(() => {
    let frameId;

    const animateMarker = () => {
      frameId = requestAnimationFrame(animateMarker);

      const engine = globeRef?.current?._getEngine?.() || {};
      const { camera, renderer } = engine;
      if (!camera || !renderer?.domElement) return;

      const now = performance.now();
      const delta = (now - animRef.current.lastTime) / 1000;
      animRef.current.lastTime = now;

      animRef.current.progress = (animRef.current.progress + delta * 0.22) % 1.0;
      const t = animRef.current.progress;

      // Origin and destination coordinates
      const origin = CITIES.Delhi;
      const dest = activeDestination?.coords || CITIES.Goa;

      const start = latLngToVector3(origin.lat, origin.lng, 1.05);
      const end = latLngToVector3(dest.lat, dest.lng, 1.05);

      // Elevated 3D Bezier control point
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(1.05 + dist * 0.25);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pos3D = curve.getPoint(t);
      const tangent = curve.getTangent(t);

      // Check facing towards camera (never clip behind globe)
      const cameraDir = camera.position.clone().normalize();
      const facing = pos3D.clone().normalize().dot(cameraDir);

      if (facing < 0.15) {
        setMarkerPos(null);
        return;
      }

      // Project 3D vector to 2D screen coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      const projected = pos3D.clone().project(camera);

      const x = (projected.x * 0.5 + 0.5) * rect.width;
      const y = (-projected.y * 0.5 + 0.5) * rect.height;

      // Tangent rotation angle in 2D screen space
      const projectedNext = pos3D.clone().add(tangent.clone().multiplyScalar(0.05)).project(camera);
      const nextX = (projectedNext.x * 0.5 + 0.5) * rect.width;
      const nextY = (-projectedNext.y * 0.5 + 0.5) * rect.height;
      const rotAngle = Math.atan2(nextY - y, nextX - x) * (180 / Math.PI);

      setMarkerPos({ x, y, opacity: Math.min(1, (facing - 0.15) * 3) });
      setAngle(rotAngle);
    };

    animateMarker();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [globeRef, activeDestination]);

  if (!markerPos) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-20"
      aria-hidden="true"
    >
      {/* 🚀 / ✈️ Travel Marker */}
      <div
        className="absolute transition-transform duration-75 ease-linear flex items-center justify-center"
        style={{
          transform: `translate3d(${markerPos.x}px, ${markerPos.y}px, 0) translate(-50%, -50%)`,
          opacity: markerPos.opacity,
        }}
      >
        {/* Subtle Cyan Glowing Halo */}
        <div className="absolute h-8 w-8 rounded-full bg-cyan-400/20 blur-sm animate-pulse" />
        <div className="absolute h-5 w-5 rounded-full border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

        {/* Floating Animated 🚀 Emoji */}
        <span
          className="relative text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-bounce"
          style={{
            display: 'inline-block',
            transform: `rotate(${angle + 45}deg)`,
            animationDuration: '2.5s',
          }}
        >
          🚀
        </span>
      </div>
    </div>
  );
}
