import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Leva } from 'leva';
import { KeyboardControls, Loader } from '@react-three/drei';
import Scene from './game/Scene';

function App() {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/sounds/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    (window as any).bgmAudio = audio;
    
    return () => {
      audio.pause();
    };
  }, []);

  const handleStart = async () => {
    if (hasStarted) return;
    
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
    
    setHasStarted(true);
    (window as any).gameStarted = true;
    window.dispatchEvent(new Event('game-start'));
    
    if ((window as any).bgmAudio) {
      (window as any).bgmAudio.play().catch((e: any) => console.warn("Audio play blocked:", e));
    }
  };

  return (
    <>
      {!hasStarted && (
        <div 
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ 
            transform: 'translateY(35vh)', 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontFamily: '"Georgia", "Times New Roman", serif', 
            fontSize: '0.85rem', 
            letterSpacing: '0.15em', 
            fontStyle: 'italic'
          }}>
            click anywhere to start
          </span>
        </div>
      )}
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
