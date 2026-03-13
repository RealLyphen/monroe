'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const World = dynamic(() => import('../ui/globe').then((m) => m.World), {
  ssr: false,
});

export default function AceternityGlobe() {
  const globeConfig = {
    pointSize: 4,
    globeColor: '#000000', // Pure black sphere to blend with background
    showAtmosphere: false,
    atmosphereColor: '#FFFFFF',
    atmosphereAltitude: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: 'rgba(245, 197, 24, 0.8)', // Monroe yellow for the continent dots
    ambientLight: '#ffffff',
    directionalLeftLight: '#ffffff',
    directionalTopLight: '#ffffff',
    pointLight: '#ffffff',
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 30, lng: -80 }, // Centered on North America initially
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };

  const colors = ['#f5c518']; // Pure yellow for all arcs and pulsing rings

  const sampleArcs = [
    { order: 1, startLat: 37.7749, startLng: -122.4194, endLat: 40.7128, endLng: -74.0060, arcAlt: 0.2, color: colors[0] }, // SF to NYC
    { order: 2, startLat: 40.7128, startLng: -74.0060, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: colors[0] }, // NYC to London
    { order: 3, startLat: 51.5072, startLng: -0.1276, endLat: 28.6139, endLng: 77.2090, arcAlt: 0.5, color: colors[0] }, // London to Delhi
    { order: 4, startLat: 28.6139, startLng: 77.2090, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.3, color: colors[0] }, // Delhi to Singapore
    { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.4, color: colors[0] }, // Singapore to Sydney
    { order: 6, startLat: -23.5505, startLng: -46.6333, endLat: 40.7128, endLng: -74.0060, arcAlt: 0.4, color: colors[0] }, // Sao Paulo to NYC
    { order: 7, startLat: 35.6762, startLng: 139.6503, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.6, color: colors[0] }, // Tokyo to SF
    { order: 8, startLat: 48.8566, startLng: 2.3522, endLat: 25.2048, endLng: 55.2708, arcAlt: 0.3, color: colors[0] }, // Paris to Dubai
    { order: 9, startLat: 25.2048, startLng: 55.2708, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.4, color: colors[0] }, // Dubai to Tokyo
    { order: 10, startLat: -33.9249, startLng: 18.4241, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.5, color: colors[0] }, // Cape Town to London
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, bottom: 0, zIndex: 10 }}>
        <World data={sampleArcs} globeConfig={globeConfig} />
      </div>
    </div>
  );
}
