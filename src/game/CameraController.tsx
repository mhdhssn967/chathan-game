import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function CameraController() {
  const cameraTarget = useRef(new THREE.Vector3(0, 4, 0));
  const cameraPosition = useRef(new THREE.Vector3(0, 4, 15));

  useFrame((state) => {
    const player = state.scene.getObjectByName('player');
    if (player) {
      const playerPos = player.getWorldPosition(new THREE.Vector3());
      // Offset camera to the right so player appears on the left
      const offset = 8;
      
      cameraTarget.current.set(playerPos.x + offset, 4, 0);
      cameraPosition.current.set(playerPos.x + offset, 4, 15);
    }

    // Smoothly interpolate camera position and lookAt
    state.camera.position.lerp(cameraPosition.current, 0.1);
    state.camera.lookAt(cameraTarget.current);
  });

  return null;
}
