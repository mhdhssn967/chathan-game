import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Moon from './Moon';

export default function Level() {
  const houseTexture = useTexture('/environment/env.png?v=6');
  houseTexture.colorSpace = THREE.SRGBColorSpace;
  
  const aspect = houseTexture.image ? houseTexture.image.width / houseTexture.image.height : 1;
  const height = 6;
  const width = height * aspect;

  return (
    <group>
      <Moon />

      {/* Background House */}
      <mesh position={[-14, height / 2, -4]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          map={houseTexture} 
          transparent 
          alphaTest={0.1} 
          emissive="#26262e" 
          emissiveIntensity={1}
        />
      </mesh>

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
