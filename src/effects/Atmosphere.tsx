import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Atmosphere() {
  const pointsRef1 = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);
  const pointsRef3 = useRef<THREE.Points>(null);
  
  // Generate random positions once
  const generateParticles = (count: number) => {
    return new Float32Array(Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 40));
  };
  
  const particles1 = useMemo(() => generateParticles(1000), []);
  const particles2 = useMemo(() => generateParticles(400), []);
  const particles3 = useMemo(() => generateParticles(100), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Slow, tiny particles moving gently
    if (pointsRef1.current) {
      pointsRef1.current.rotation.y = t * 0.02;
      pointsRef1.current.rotation.x = t * 0.01;
    }
    
    // Medium, faster particles moving in the opposite direction
    if (pointsRef2.current) {
      pointsRef2.current.rotation.y = -t * 0.05;
      pointsRef2.current.rotation.z = t * 0.02;
    }
    
    // Large, very fast particles bobbing and moving erratically
    if (pointsRef3.current) {
      pointsRef3.current.rotation.y = t * 0.1;
      pointsRef3.current.rotation.x = -t * 0.08;
      pointsRef3.current.position.y = Math.sin(t * 2) * 0.5;
    }
  });

  return (
    <group>
      <Points ref={pointsRef1} positions={particles1} stride={3}>
        <PointMaterial transparent color="#ffffff" size={0.05} sizeAttenuation={true} depthWrite={false} opacity={0.5} />
      </Points>
      <Points ref={pointsRef2} positions={particles2} stride={3}>
        <PointMaterial transparent color="#ffffff" size={0.10} sizeAttenuation={true} depthWrite={false} opacity={0.7} />
      </Points>
      <Points ref={pointsRef3} positions={particles3} stride={3}>
        <PointMaterial transparent color="#ffffff" size={0.20} sizeAttenuation={true} depthWrite={false} opacity={0.9} />
      </Points>
    </group>
  );
}
