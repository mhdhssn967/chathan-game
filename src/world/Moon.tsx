import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the generated moon texture
  const moonTexture = useTexture('/environment/moon_texture.png');
  moonTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (meshRef.current) {
      // Keep it fixed relative to the camera to act as a skybox element, so it's always in view
      meshRef.current.position.x = state.camera.position.x + 3; // Right side of the screen
      meshRef.current.position.y = state.camera.position.y + 5; // High up
      
      // The moon is tidally locked (doesn't spin), which perfectly hides the texture seam in the back!
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -20]} rotation={[0, 1.5, 0]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        map={moonTexture}
        color="#aaccff" 
        emissive="#113366"
        emissiveMap={moonTexture}
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </mesh>
  );
}
