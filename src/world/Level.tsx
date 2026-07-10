import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

function Rocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clusterCount = 30;
  const rocksPerCluster = 5;
  const count = clusterCount * rocksPerCluster; // 150 rocks
  
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    
    let index = 0;
    for (let c = 0; c < clusterCount; c++) {
      // Pick a random cluster center
      const cx = -50 + Math.random() * 250;
      const cz = -4.5 + Math.random() * 9;
      
      for (let r = 0; r < rocksPerCluster; r++) {
        // Spread rocks around the center
        const x = cx + (Math.random() - 0.5) * 1.5;
        const z = cz + (Math.random() - 0.5) * 1.5;
        const scale = 0.15 + Math.random() * 0.35;
        
        dummy.position.set(x, 0, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.scale.set(scale, scale * (0.4 + Math.random() * 0.6), scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(index++, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1a1a20" roughness={0.9} metalness={0.2} />
    </instancedMesh>
  );
}

function Grass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const count = 12000;
  
  // Pre-generate shorter geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.06, 0.2, 1, 3);
    geo.translate(0, 0.1, 0); 
    return geo;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const x = -50 + Math.random() * 250;
      const z = -4.8 + Math.random() * 9.6;
      
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, Math.random() * Math.PI, 0);
      
      // More variety in length, but kept short overall
      const scaleX = 0.5 + Math.random() * 0.5;
      const scaleY = 0.3 + Math.random() * 1.5; 
      
      dummy.scale.set(scaleX, scaleY, scaleX);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Update the custom shader time uniform for the wind simulation
  useFrame((state) => {
    if (materialRef.current?.userData?.shader) {
      materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined as any, count]} castShadow receiveShadow>
      <meshStandardMaterial 
        ref={materialRef} 
        color="#08100a" 
        roughness={1.0} 
        side={THREE.DoubleSide}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = { value: 0 };
          if (materialRef.current) materialRef.current.userData.shader = shader;
          
          shader.vertexShader = `
            uniform float uTime;
            ${shader.vertexShader}
          `.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            // Generate a random-looking phase offset based on the instance's world position X and Z
            float phase = instanceMatrix[3][0] * 0.5 + instanceMatrix[3][2] * 0.5; 
            
            // Calculate wind sway
            float sway = sin(uTime * 1.5 + phase) * 0.15;
            
            // Normalize height (Y goes from 0 to 0.2 because of our translation)
            float h = transformed.y / 0.2;
            
            // Apply quadratic bending
            float bend = h * h * sway;
            
            transformed.x += bend;
            transformed.z += bend * 0.5;
            `
          );
        }}
      />
    </instancedMesh>
  );
}

export default function Level() {
  return (
    <group>
      {/* Decorative Elements */}
      <Rocks />
      <Grass />

      {/* Main Ground Platform */}
      <RigidBody type="fixed" friction={1}>
        <mesh position={[50, -5, 0]} receiveShadow>
          <boxGeometry args={[300, 10, 10]} />
          <meshStandardMaterial color="#2c2c36" roughness={0.8} metalness={0.1} />
        </mesh>
      </RigidBody>
    </group>
  );
}
