import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const OrbComponent = ({ bodyRef, direction, onComplete }: { bodyRef: React.RefObject<RapierRigidBody | null>, direction: number, onComplete: () => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef<'charging' | 'shooting'>('charging');
  const chargeStartTime = useRef(Date.now());
  
  useEffect(() => {
    const timer = setTimeout(() => {
      stateRef.current = 'shooting';
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !outerRef.current) return;
    
    const totalElapsed = Date.now() - chargeStartTime.current;
    
    // Wait 0.4s before appearing
    if (totalElapsed < 400) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    
    // Adjust elapsed time by the 400ms delay
    const elapsed = totalElapsed - 400;
    
    // Lightning jitter effect
    const jitter = 1 + Math.random() * 0.5;
    outerRef.current.scale.setScalar(jitter);
    outerRef.current.rotation.x += delta * 20;
    outerRef.current.rotation.y += delta * 25;
    
    if (stateRef.current === 'charging') {
      if (bodyRef.current) {
        const p = bodyRef.current.translation();
        // Closer to character
        groupRef.current.position.set(p.x + direction * 0.8, p.y + 1.2, p.z);
      }
      
      // Grow to full size in 600ms
      const progress = Math.min(elapsed / 600, 1);
      // Ease out cubic for a fast, punchy growth
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      // 5% larger final size
      const baseScale = 0.1 + (easedProgress * 0.95);
      
      groupRef.current.scale.setScalar(baseScale + Math.sin(Date.now() / 50) * 0.1 * easedProgress);
    } else {
      groupRef.current.scale.setScalar(1.2);
      groupRef.current.position.x += direction * 35 * delta;
      
      if (Math.abs(groupRef.current.position.x) > 100) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bright Core */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      {/* Lightning Wireframe */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} wireframe toneMapped={false} />
      </mesh>
      <pointLight color="#00ffff" intensity={6} distance={6} />
    </group>
  );
};

export default function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isGrounded = useRef(false);
  const isAttacking = useRef(false);
  const isDead = useRef(false);
  const isJumping = useRef(false);
  const isNormalJumping = useRef(false);
  const isWaking = useRef(true);
  const currentSpeed = useRef(1.8);
  const [orbs, setOrbs] = useState<{ id: number, dir: number }[]>([]);
  
  // Load character GLB
  const { scene, animations } = useGLTF('/chathannew.glb');
  const { actions, names } = useAnimations(animations, groupRef);
  
  // Controls
  const [, getKeys] = useKeyboardControls();
  
  // Find a walking animation automatically (fallback to run or nothing)
  const walkAnimName = names.find(n => n.toLowerCase().includes('walking') && !n.toLowerCase().includes('jump')) || names.find(n => n.toLowerCase().includes('run'));
  const runAnimName = names.find(n => n.toLowerCase().includes('run') && !n.toLowerCase().includes('jump')) || walkAnimName;
  const jumpAnimName = names.find(n => n.toLowerCase().includes('jump') && !n.toLowerCase().includes('run') && !n.toLowerCase().includes('fast')) || names.find(n => n.toLowerCase().includes('jump'));
  const runJumpAnimName = names.find(n => n.toLowerCase().includes('jump') && (n.toLowerCase().includes('run') || n.toLowerCase().includes('fast'))) || jumpAnimName;
  const attackAnimName = names.find(n => n.toLowerCase().includes('attack'));
  const deathAnimName = names.find(n => n.toLowerCase().includes('death') || n.toLowerCase().includes('die'));
  const wakeAnimName = names.find(n => n.toLowerCase().includes('wake'));
  const fallAnimName = names.find(n => n.toLowerCase().includes('fall'));
  
  const idleAnimNames = useMemo(() => {
    const idles = names.filter(n => n.toLowerCase().includes('idle'));
    return idles.length > 0 ? idles : [names[0]];
  }, [names]);

  const [currentAnim, setCurrentAnim] = useState<string | null>(wakeAnimName || idleAnimNames[0] || null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const handleStart = () => setHasStarted(true);
    window.addEventListener('game-start', handleStart);
    if ((window as any).gameStarted) setHasStarted(true);
    return () => window.removeEventListener('game-start', handleStart);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    
    if (wakeAnimName && actions[wakeAnimName]) {
      actions[wakeAnimName].paused = false;
      const duration = actions[wakeAnimName].getClip().duration;
      const timeout = setTimeout(() => {
        isWaking.current = false;
        setCurrentAnim(idleAnimNames[0]);
      }, duration * 1000);
      return () => clearTimeout(timeout);
    } else {
      isWaking.current = false;
    }
  }, [hasStarted, wakeAnimName, actions, idleAnimNames]);

  useEffect(() => {
    // Enable shadows on the loaded model
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Attach glowing eyes to the head bone
    const head = scene.getObjectByName('mixamorig:Head');
    if (head && !head.getObjectByName('glowing_eyes')) {
      const eyeGroup = new THREE.Group();
      eyeGroup.name = 'glowing_eyes';
      
      const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const eyeMat = new THREE.MeshStandardMaterial({
        color: '#00ffff',
        emissive: '#00ffff',
        emissiveIntensity: 6,
        toneMapped: false
      });
      
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      // X: left/right, Y: up/down along bone, Z: forward/backward
      leftEye.position.set(0.08, 0.12, 0.15); 
      
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(-0.08, 0.12, 0.15);
      
      const eyeLight = new THREE.PointLight('#00ffff', 2, 3);
      eyeLight.position.set(0, 0.12, 0.2);
      
      eyeGroup.add(leftEye, rightEye, eyeLight);
      head.add(eyeGroup);
    }
  }, [scene]);

  useEffect(() => {
    if (!currentAnim || !actions[currentAnim]) return;
    
    const action = actions[currentAnim];
    if (action) {
      if (currentAnim === wakeAnimName || currentAnim === jumpAnimName || currentAnim === runJumpAnimName || currentAnim === attackAnimName || currentAnim === deathAnimName) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        // Run, Walk, Idle, and Fall will loop.
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      }
      
      action.setEffectiveTimeScale(1);
      
      // Play current animation
      action.reset().fadeIn(0.5).play();

      if (currentAnim === wakeAnimName && !hasStarted) {
        action.paused = true;
        action.time = 0.1; // Hold at ~3rd frame
      }
    }
    
    return () => {
      actions[currentAnim]?.fadeOut(0.5);
    };
  }, [currentAnim, actions, jumpAnimName, runJumpAnimName]);

  // Handle idle transitions
  useEffect(() => {
    if (!currentAnim || !idleAnimNames.includes(currentAnim) || idleAnimNames.length <= 1) return;

    const timeout = setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * idleAnimNames.length);
      } while (idleAnimNames[nextIndex] === currentAnim);
      
      setCurrentAnim(idleAnimNames[nextIndex]);
    }, 3000 + Math.random() * 3000); // Transition every 3-6 seconds

    return () => clearTimeout(timeout);
  }, [currentAnim, idleAnimNames]);

  useFrame(() => {
    if (!bodyRef.current || !groupRef.current) return;

    const { left, right, up, attack, run, death, skipIntro } = getKeys() as any;

    if (skipIntro && isWaking.current) {
      isWaking.current = false;
      setCurrentAnim(idleAnimNames[0] || null);
    }

    if (death && !isDead.current && deathAnimName) {
      isDead.current = true;
      setCurrentAnim(deathAnimName);
    }
    
    if (isDead.current && attack && wakeAnimName) {
      isDead.current = false;
      isWaking.current = true;
      setCurrentAnim(wakeAnimName);
      
      const duration = actions[wakeAnimName]?.getClip().duration || 1;
      setTimeout(() => {
        isWaking.current = false;
      }, duration * 1000);
    }
    
    if (isDead.current || isWaking.current || !hasStarted) {
      const velocity = bodyRef.current.linvel();
      bodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
      return;
    }
    
    if (attack && !isAttacking.current && attackAnimName && isGrounded.current) {
      isAttacking.current = true;
      setCurrentAnim(attackAnimName);
      
      const dir = groupRef.current.rotation.y > 0 ? 1 : -1;
      setOrbs(prev => [...prev, { id: Date.now(), dir }]);
      
      const duration = actions[attackAnimName]?.getClip().duration || 1;
      setTimeout(() => {
        isAttacking.current = false;
      }, duration * 1000);
    }
    
    const targetSpeed = run ? 4.55 : 1.8;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.1);
    
    const jumpForce = 4.5; // Halved for shorter jump
    const velocity = bodyRef.current.linvel();
    let moveX = 0;

    if (right && !isAttacking.current) moveX = currentSpeed.current;
    if (left && !isAttacking.current) moveX = -currentSpeed.current;

    let moveY = velocity.y;
    
    // Jump animation logic
    if (up && isGrounded.current && !isAttacking.current && !isJumping.current) {
      isJumping.current = true;
      isNormalJumping.current = !run;
      const targetAnim = run ? runJumpAnimName : jumpAnimName;
      if (targetAnim) setCurrentAnim(targetAnim);
      
      if (run) {
        bodyRef.current.applyImpulse({ x: 0, y: jumpForce * 1.2, z: 0 }, true);
      } else {
        setTimeout(() => {
          if (bodyRef.current) {
            bodyRef.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
          }
        }, 700);
      }
      
      const duration = actions[targetAnim || '']?.getClip().duration || 1;
      setTimeout(() => {
        isJumping.current = false;
        isNormalJumping.current = false;
      }, duration * 1000);
    }

    if (isNormalJumping.current) {
      moveX = 0;
    }

    // Apply movement
    bodyRef.current.setLinvel({ x: moveX, y: moveY, z: 0 }, true);

    // Update animation state based on movement
    if (!isAttacking.current && !isJumping.current) {
      if (!isGrounded.current) {
      const targetAnim = (velocity.y < -0.1 && fallAnimName) ? fallAnimName : ((run ? runJumpAnimName : jumpAnimName) || walkAnimName || names[0]);
      if (targetAnim && currentAnim !== targetAnim) setCurrentAnim(targetAnim);
      
      if (Math.abs(moveX) > 0.1) {
        const angle = moveX > 0 ? Math.PI / 2 : -Math.PI / 2;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.2);
      }
    } else if (Math.abs(moveX) > 0.1) {
      const targetAnim = (run ? runAnimName : walkAnimName) || names[0];
      if (targetAnim && currentAnim !== targetAnim) setCurrentAnim(targetAnim);
      
      // Angles were exactly inverted! Swapping them to fix facing direction.
      const angle = moveX > 0 ? Math.PI / 2 : -Math.PI / 2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.2
      );
      } else {
        if (!currentAnim || !idleAnimNames.includes(currentAnim)) {
          setCurrentAnim(idleAnimNames[0] || null);
        }
      }
    }
  });

  return (
    <>
      <RigidBody 
        ref={bodyRef} 
        position={[-12, 0, 0]} 
        lockRotations 
        enabledRotations={[false, false, false]}
        type="dynamic"
        colliders={false}
        onCollisionEnter={() => { isGrounded.current = true; }}
        onCollisionExit={() => { isGrounded.current = false; }}
      >
        <CapsuleCollider args={[1.4, 0.8]} position={[0, 2.2, 0]} />
        <group ref={groupRef} name="player" rotation={[0, Math.PI / 2, 0]}>
          <primitive object={scene} scale={2} position={[0, 0, 0]} />
        </group>
      </RigidBody>
      
      {orbs.map(orb => (
        <OrbComponent 
          key={orb.id} 
          bodyRef={bodyRef} 
          direction={orb.dir} 
          onComplete={() => setOrbs(prev => prev.filter(o => o.id !== orb.id))} 
        />
      ))}
    </>
  );
}
