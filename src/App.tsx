import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Leva } from 'leva';
import { KeyboardControls, Loader } from '@react-three/drei';
import Scene from './game/Scene';

function App() {
  useEffect(() => {
    const audio = new Audio('/sounds/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    
    const playAudio = () => {
      audio.play().catch(e => console.warn("Audio autoplay blocked:", e));
    };
    
    // Play on first interaction to avoid browser autoplay restrictions
    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('keydown', playAudio, { once: true });
    
    return () => {
      audio.pause();
      window.removeEventListener('click', playAudio);
      window.removeEventListener('keydown', playAudio);
    };
  }, []);

  return (
    <>
      <Leva collapsed />
      <KeyboardControls
        map={[
          { name: 'up', keys: ['ArrowUp', 'w', 'W', 'Space'] },
          { name: 'attack', keys: ['f', 'F'] },
          { name: 'death', keys: ['g', 'G'] },
          { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'skipIntro', keys: ['t', 'T'] },
        ]}
      >
        <Canvas
        shadows
        orthographic
        camera={{ position: [0, 4, 15], zoom: 60 }}
        gl={{
          antialias: false,
          toneMappingExposure: 1.2,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#354266']} />
        
        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
      </KeyboardControls>
      <Loader />
    </>
  );
}

export default App;
