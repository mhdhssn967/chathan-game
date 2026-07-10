import { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Theyyam() {
  const groupRef = useRef<THREE.Group>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const hasJumpScared = useRef(false);
  const hasRunAway = useRef(false);
  const isRunningAway = useRef(false);
  
  const hasCrawledBack = useRef(false);
  const isCrawlingBack = useRef(false);
  
  const jumpscareAudio = useMemo(() => new Audio('/sounds/jumpscare.mp3'), []);
  const screamAudio = useMemo(() => new Audio('/sounds/scream.mp3'), []);
  const scream2Audio = useMemo(() => new Audio('/sounds/scream2.mp3'), []);
  
  const { scene, animations } = useGLTF('/gamecharacters/theyyam_emissive.glb');
  const { actions, names } = useAnimations(animations, groupRef);
  
  const idleAnimName = useMemo(() => names.find(n => n.toLowerCase().includes('idle')) || names[0], [names]);
  const runStopAnimName = useMemo(() => names.find(n => n.toLowerCase().includes('scare')) || idleAnimName, [names, idleAnimName]);
  const runAnimName = useMemo(() => names.find(n => n.toLowerCase() === 'run' || n.toLowerCase().includes('run')) || names[0], [names]);
  const crawlAnimName = useMemo(() => names.find(n => n.toLowerCase().includes('crawl')) || runAnimName, [names, runAnimName]);
  
  const [currentAnim, setCurrentAnim] = useState<string | null>(idleAnimName);
  const previousAnimRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentAnim || !actions[currentAnim]) return;
    
    const action = actions[currentAnim];
    const prevAction = previousAnimRef.current ? actions[previousAnimRef.current] : null;
    
    // Smooth 3-second transition specifically from scare to idle
    const fadeTime = (currentAnim === idleAnimName && previousAnimRef.current === runStopAnimName) ? 3.0 : 0.2;
    
    if (prevAction && prevAction !== action) {
      prevAction.fadeOut(fadeTime);
    }
    
    if (action) {
      if (currentAnim === runStopAnimName) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      }
      
      action.reset().fadeIn(fadeTime).play();
    }
    
    previousAnimRef.current = currentAnim;
  }, [currentAnim, actions, runStopAnimName, idleAnimName]);

  useEffect(() => {
    // Enable shadows on the loaded model
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      if (child.type === 'Bone' && child.name.toLowerCase().includes('head') && !headBoneRef.current) {
        if (!child.name.toLowerCase().includes('end')) {
          headBoneRef.current = child;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    const player = state.scene.getObjectByName('player');
    if (player && groupRef.current) {
      const playerPos = new THREE.Vector3();
      player.getWorldPosition(playerPos);
      
      const theyyamPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(theyyamPos);
      
      if (headBoneRef.current && !isRunningAway.current && !isCrawlingBack.current) {
        const headTarget = playerPos.clone();
        headTarget.y += 3; 
        headBoneRef.current.lookAt(headTarget);
      }
      
      if (!hasJumpScared.current) {
        const distance = playerPos.distanceTo(theyyamPos);
        
        // Threshold for "somewhat near"
        if (distance < 6) {
          hasJumpScared.current = true;
          setCurrentAnim(runStopAnimName);
          
          jumpscareAudio.currentTime = 0;
          jumpscareAudio.volume = 1.0;
          jumpscareAudio.play().catch(e => console.warn("Audio play blocked", e));
          
          const duration = actions[runStopAnimName]?.getClip().duration || 2;
          setTimeout(() => {
            if (!isRunningAway.current && !isCrawlingBack.current) {
              setCurrentAnim(idleAnimName);
            }
          }, duration * 1000);
        }
      }

      // Check if player moved past Theyyam (Theyyam is off-screen on the left)
      if (playerPos.x > groupRef.current.position.x + 15 && !hasRunAway.current) {
        hasRunAway.current = true;
        isRunningAway.current = true;
        setCurrentAnim(runAnimName);
        
        // Face right
        groupRef.current.rotation.y = Math.PI / 2;
        
        screamAudio.currentTime = 0;
        screamAudio.volume = 1.0;
        screamAudio.play().catch(e => console.warn("Audio play blocked", e));
      }
      
      // Check if theyyam ran far enough to the right to be out of screen
      if (isRunningAway.current && !hasCrawledBack.current && groupRef.current.position.x > playerPos.x + 40) {
        hasCrawledBack.current = true; // Mark timer as started
        
        setTimeout(() => {
          isRunningAway.current = false;
          isCrawlingBack.current = true;
          setCurrentAnim(crawlAnimName);
          
          // Face left
          if (groupRef.current) {
            groupRef.current.rotation.y = -Math.PI / 2;
          }
          
          screamAudio.currentTime = 0;
          screamAudio.volume = 1.0;
          screamAudio.play().catch(e => console.warn("Audio play blocked", e));

          scream2Audio.currentTime = 0;
          scream2Audio.volume = 1.0; 
          scream2Audio.play().catch(e => console.warn("Audio play blocked", e));
        }, 4000); // Wait 4 seconds after going out of screen
      }
      
      // Update running/crawling position
      if (isRunningAway.current) {
        // Run towards right faster than player
        groupRef.current.position.x += 12 * delta;
      } else if (isCrawlingBack.current) {
        // Crawl super fast to the left
        groupRef.current.position.x -= 20 * delta;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[20, 0, -3]} 
      rotation={[0, 0, 0]}
    >
      <primitive object={scene} scale={6} />
    </group>
  );
}

useGLTF.preload('/gamecharacters/theyyam_emissive.glb');
