import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Shiny Gold Material properties
const goldColor = new THREE.Color('#D4A437');
const darkGoldColor = new THREE.Color('#AA7C11');

const GoldMaterial = ({ roughness = 0.15, metalness = 0.9 }) => (
  <meshStandardMaterial
    color={goldColor}
    roughness={roughness}
    metalness={metalness}
    envMapIntensity={1.5}
  />
);

// 1. Procedural Scissor Component
const ProceduralScissors = (props) => {
  const group = useRef();
  
  // Custom slow spinning animation + gentle hover
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = time * 0.15;
      group.current.position.y = Math.sin(time * 0.8) * 0.15;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Pivot point Center Screw */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="#AA7C11" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Scissor Shafts */}
      {/* Left Shaft */}
      <mesh position={[-0.15, -0.4, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.03, 0.02, 0.8, 12]} />
        <GoldMaterial />
      </mesh>
      {/* Right Shaft */}
      <mesh position={[0.15, -0.4, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.03, 0.02, 0.8, 12]} />
        <GoldMaterial />
      </mesh>

      {/* Scissor Handles (Finger Rings) */}
      {/* Left Ring */}
      <mesh position={[-0.32, -0.85, 0]} rotation={[0, 0.4, 0]}>
        <torusGeometry args={[0.15, 0.032, 16, 48]} />
        <GoldMaterial />
      </mesh>
      {/* Right Ring */}
      <mesh position={[0.32, -0.85, 0]} rotation={[0, -0.4, 0]}>
        <torusGeometry args={[0.15, 0.032, 16, 48]} />
        <GoldMaterial />
      </mesh>

      {/* Scissor Blades */}
      {/* Left Blade */}
      <mesh position={[0.12, 0.52, 0.01]} rotation={[0, 0, 0.06]}>
        <boxGeometry args={[0.045, 1.0, 0.015]} />
        <GoldMaterial roughness={0.08} metalness={0.95} />
      </mesh>
      {/* Right Blade */}
      <mesh position={[-0.12, 0.52, -0.01]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.045, 1.0, 0.015]} />
        <GoldMaterial roughness={0.08} metalness={0.95} />
      </mesh>
    </group>
  );
};

// 2. Procedural Gold Ring (Orbital rings)
const GoldRing = ({ radius, width, speed, hoverOffset, ...props }) => {
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.x = time * speed;
      ringRef.current.rotation.y = time * (speed * 0.7);
      ringRef.current.position.y = Math.sin(time * 1.2 + hoverOffset) * 0.12;
    }
  });

  return (
    <mesh ref={ringRef} {...props}>
      <torusGeometry args={[radius, width, 16, 64]} />
      <GoldMaterial roughness={0.05} metalness={0.95} />
    </mesh>
  );
};

// 3. Procedural Comb Component
const ProceduralComb = (props) => {
  const group = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.z = time * 0.2;
      group.current.rotation.x = time * 0.08;
      group.current.position.y = Math.cos(time * 0.9) * 0.12;
    }
  });

  // Calculate teeth positions
  const numTeeth = 25;
  const combWidth = 0.9;
  const spacing = combWidth / numTeeth;

  return (
    <group ref={group} {...props}>
      {/* Comb Spine */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[combWidth, 0.08, 0.02]} />
        <GoldMaterial />
      </mesh>
      {/* Comb Handle */}
      <mesh position={[-0.65, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.07, 0.02]} />
        <GoldMaterial />
      </mesh>
      {/* Comb Teeth */}
      {Array.from({ length: numTeeth }).map((_, i) => {
        const xPos = -combWidth / 2 + i * spacing;
        return (
          <mesh key={i} position={[xPos, -0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.25, 8]} />
            <GoldMaterial roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
};

// 4. Interactive Lights & Camera controller
const InteractiveStage = ({ children }) => {
  const stageRef = useRef();

  useFrame((state) => {
    // Dynamic parallax tilt matching mouse movement
    const targetX = state.pointer.x * 0.5;
    const targetY = state.pointer.y * 0.4;
    
    if (stageRef.current) {
      stageRef.current.rotation.y += (targetX - stageRef.current.rotation.y) * 0.08;
      stageRef.current.rotation.x += (-targetY - stageRef.current.rotation.x) * 0.08;
    }
  });

  return (
    <group ref={stageRef}>
      {children}
    </group>
  );
};

// 5. Drifting Particle Field
const FloatingParticles = () => {
  const pointsRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.03;
      pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }
  });

  const particleData = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#D4A437"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Main Export Component
export const HeroScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.4} />
        
        {/* Gold Key Light */}
        <directionalLight 
          position={[5, 5, 4]} 
          intensity={1.8} 
          color="#FFE9A3" 
          castShadow
        />
        
        {/* Fill Light */}
        <directionalLight 
          position={[-5, -2, 2]} 
          intensity={0.6} 
          color="#B0CFFF" 
        />
        
        {/* Interactive Mouse spot reflection light */}
        <pointLight
          position={[0, 0, 3]}
          intensity={1.2}
          color="#FFEBB3"
        />

        <InteractiveStage>
          {/* Main Scissor Element */}
          <ProceduralScissors position={[0, 0.2, 0]} scale={[1.2, 1.2, 1.2]} />

          {/* Luxury Comb */}
          <ProceduralComb position={[-1.6, -1.0, 0.5]} scale={[0.85, 0.85, 0.85]} />

          {/* Rotating Rings */}
          <GoldRing position={[0, 0.2, 0]} radius={1.4} width={0.03} speed={0.25} hoverOffset={0} />
          <GoldRing position={[0, 0.2, 0]} radius={1.6} width={0.015} speed={-0.18} hoverOffset={Math.PI / 3} />
          
          {/* Drift particles */}
          <FloatingParticles />
        </InteractiveStage>
      </Canvas>
    </div>
  );
};

export default HeroScene;
