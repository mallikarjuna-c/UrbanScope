import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Building component
function Building({ position, height, color, width = 1, depth = 1 }) {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef} position={[position[0], height / 2, position[1]]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}

// Tree component
function Tree({ position }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Tree foliage */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

// Park component
function Park({ position, size }) {
  const trees = useMemo(() => {
    const treePositions = [];
    for (let i = 0; i < 8; i++) {
      treePositions.push([
        position[0] + (Math.random() - 0.5) * size,
        position[1] + (Math.random() - 0.5) * size
      ]);
    }
    return treePositions;
  }, [position, size]);

  return (
    <group>
      {/* Park ground */}
      <mesh position={[position[0], 0.01, position[1]]} receiveShadow>
        <boxGeometry args={[size, 0.02, size]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      {/* Trees in park */}
      {trees.map((treePos, idx) => (
        <Tree key={idx} position={treePos} />
      ))}
    </group>
  );
}

// Urban City Scene
function CityScene({ heatLevel = 'moderate', greenCoverage = 30 }) {
  // Generate buildings based on city layout
  const buildings = useMemo(() => {
    const buildingData = [];
    const gridSize = 20;
    const spacing = 3;

    for (let x = -gridSize; x < gridSize; x += spacing) {
      for (let z = -gridSize; z < gridSize; z += spacing) {
        // Skip some positions for parks and roads
        if (Math.random() > 0.7) continue;

        const height = Math.random() * 8 + 2;
        let color;

        // Color based on heat level
        if (heatLevel === 'critical') {
          color = new THREE.Color().setHSL(0, 0.7, 0.3 + Math.random() * 0.2);
        } else if (heatLevel === 'high') {
          color = new THREE.Color().setHSL(0.05, 0.6, 0.4 + Math.random() * 0.2);
        } else if (heatLevel === 'moderate') {
          color = new THREE.Color().setHSL(0.15, 0.4, 0.5 + Math.random() * 0.2);
        } else {
          color = new THREE.Color().setHSL(0.55, 0.3, 0.6 + Math.random() * 0.2);
        }

        buildingData.push({
          position: [x + Math.random() * 0.5, z + Math.random() * 0.5],
          height,
          color,
          width: 0.8 + Math.random() * 0.4,
          depth: 0.8 + Math.random() * 0.4
        });
      }
    }
    return buildingData;
  }, [heatLevel]);

  // Generate parks based on green coverage
  const parks = useMemo(() => {
    const parkData = [];
    const numParks = Math.floor(greenCoverage / 10);
    
    for (let i = 0; i < numParks; i++) {
      parkData.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30
        ],
        size: 3 + Math.random() * 2
      });
    }
    return parkData;
  }, [greenCoverage]);

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Buildings */}
      {buildings.map((building, idx) => (
        <Building
          key={idx}
          position={building.position}
          height={building.height}
          color={building.color}
          width={building.width}
          depth={building.depth}
        />
      ))}

      {/* Parks */}
      {parks.map((park, idx) => (
        <Park key={idx} position={park.position} size={park.size} />
      ))}

      {/* Street lights */}
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#fbbf24" />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#fbbf24" />
    </>
  );
}

// Main component
function UrbanCity3D({ heatLevel = 'moderate', greenCoverage = 30, autoRotate = true }) {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={15}
          maxDistance={60}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        {/* City scene */}
        <CityScene heatLevel={heatLevel} greenCoverage={greenCoverage} />

        {/* Environment */}
        <Environment preset="city" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#1a202c', 30, 80]} />
      </Canvas>
    </div>
  );
}

export default UrbanCity3D;
