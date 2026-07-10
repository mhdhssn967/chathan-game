import { ContactShadows } from '@react-three/drei';

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} color="#2a3854" />
      
      {/* Moonlight */}
      <directionalLight
        castShadow
        position={[-10, 20, -10]}
        intensity={3.5}
        color="#8ab4f8"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      
      {/* Contact Shadows for better grounding */}
      <ContactShadows
        resolution={1024}
        scale={20}
        blur={1.5}
        opacity={0.8}
        far={10}
        color="#000000"
      />
    </>
  );
}
