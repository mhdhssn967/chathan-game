import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import Player from '../player/Player';
import Level from '../world/Level';
import Atmosphere from '../effects/Atmosphere';
import Lighting from '../lighting/Lighting';
import CameraController from './CameraController';
import Theyyam from '../world/Theyyam';
import PostProcessing from '../effects/PostProcessing';

export default function Scene() {
  const { debugCamera } = useControls({
    debugCamera: false,
  });

  return (
    <>
      <fog attach="fog" args={['#354266', 15, 80]} />
      
      {/* Lighting System */}
      <Lighting />

      {/* World / Level Geometry */}
      <Level />

      {/* Player Character */}
      <Player />

      {/* Theyyam Character */}
      <Theyyam />

      {/* Atmospheric Effects */}
      <Atmosphere />

      {/* Camera Controller */}
      {!debugCamera && <CameraController />}
      {debugCamera && <OrbitControls />}

      {/* Post Processing Effects */}
      <PostProcessing />
    </>
  );
}
