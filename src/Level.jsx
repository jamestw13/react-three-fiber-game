import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Text } from '@react-three/drei';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floorMaterial1 = new THREE.MeshStandardMaterial({ color: 'limegreen' });
const floorMaterial2 = new THREE.MeshStandardMaterial({ color: 'greenyellow' });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategray' });

export function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Float floatIntensity={0.25} rotationIntensity={0.25}>
        <Text
          font="./bebas-neue-v9-latin-regular.woff"
          maxWidth={0.25}
          lineHeight={0.75}
          scale={0.5}
          textAlign="right"
          position={[0.75, 0.65, 0]}
          rotation-y={-0.25}
        >
          Marble Race
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>
      <mesh
        geometry={boxGeometry}
        material={floorMaterial1}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
    </group>
  );
}

export function BlockEnd({ position = [0, 0, 0] }) {
  const hamburger = useGLTF('hamburger.glb');
  hamburger.scene.children.forEach(child => {
    child.castShadow = true;
  });
  return (
    <group position={position}>
      <Text font="./bebas-neue-v9-latin-regular.woff" scale={1} position={[0, 2.25, 2]}>
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text>

      <mesh geometry={boxGeometry} material={floorMaterial1} position={[0, 0, 0]} scale={[4, 0.25, 4]} receiveShadow />

      <RigidBody type="fixed" colliders="hull" restitution={0.2} friction={0} position={[0, 0.25, 0]}>
        <primitive object={hamburger.scene} scale={0.2} />
      </RigidBody>
    </group>
  );
}

export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [speed] = useState(() => ((Math.random() + 0.2) * Math.random() < 0.5 ? -1 : 1));

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floorMaterial2}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          // position={[0, 0.5, 0]}
          scale={[3.5, 0.3, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => (Math.random() + 0.2) * Math.PI * 2);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    const y = Math.sin(time + timeOffset) + 1.15;

    obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floorMaterial2}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          // position={[0, 0.5, 0]}
          scale={[3.5, 0.3, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => (Math.random() + 0.2) * Math.PI * 2);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    const x = Math.sin(time + timeOffset) * 1.25;

    obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] });
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floorMaterial2}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          // position={[0, 0.5, 0]}
          scale={[1.5, 1.5, 0.3]}
          castShadow
          receiveShadow
        />
      </RigidBody>
    </group>
  );
}

function Bounds({ length = 1 }) {
  return (
    <RigidBody type="fixed" restitution={0.2} friction={0}>
      <mesh
        geometry={boxGeometry}
        material={wallMaterial}
        position={[2.15, 0.75, -(length * 2) + 2]}
        scale={[0.2, 1.5, 4 * length]}
        castShadow
      />
      <mesh
        geometry={boxGeometry}
        material={wallMaterial}
        position={[-2.15, 0.75, -(length * 2) + 2]}
        scale={[0.2, 1.5, 4 * length]}
        receiveShadow
      />
      <mesh
        geometry={boxGeometry}
        material={wallMaterial}
        position={[0, 0.75, -(length * 4) + 2]}
        scale={[4, 1.5, 0.3]}
        receiveShadow
      />
      <CuboidCollider args={[2, 0.1, 2 * length]} position={[0, -0.1, -(length * 2) + 2]} friction={1} />
    </RigidBody>
  );
}

export function Level({ count = 5, types = [BlockSpinner, BlockLimbo, BlockAxe], seed = 0 }) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types]);

  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      {blocks.map((Block, i) => (
        <Block key={i} position={[0, 0, -(i + 1) * 4]} />
      ))}
      <BlockEnd position={[0, 0, -(count + 1) * 4]} />

      <Bounds length={count + 2} />
    </>
  );
}
