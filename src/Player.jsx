import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRapier, RigidBody } from '@react-three/rapier';
import { useState, useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import useGame from './stores/useGame';

export function Player() {
  const { rapier, world } = useRapier();
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();

  const [smoothedCameraPosition] = useState(new Vector3(10, 10, 10));
  const [smoothedCameraTarget] = useState(new Vector3());

  const start = useGame(state => state.start);
  const restart = useGame(state => state.restart);
  const end = useGame(state => state.end);
  const blocksCount = useGame(state => state.blocksCount);

  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);

    const hit = world.castRay(ray, 10, true);
    if (hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  const reset = () => {
    console.log('reseted');
    body.current.setTranslation({ x: 0, y: 1, z: 0 });
    body.current.setLinvel({ x: 0, y: 0, z: 0 });
    body.current.setAngvel({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      state => state.phase,
      value => {
        if (value === 'ready') {
          reset();
        }
      }
    );

    const unsubscribeJump = subscribeKeys(
      state => state.jump,
      value => {
        if (value) {
          jump();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeJump();
      unsubscribeAny();
      unsubscribeReset();
    };
  }, []);

  useFrame((state, delta) => {
    // Controls
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 1 * delta;
    const torqueStrength = 1 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }
    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }
    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    // Camera
    const bodyPosition = body.current.translation();
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.y += 1;
    cameraPosition.z += 3;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.5;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    // Phases
    if (bodyPosition.z < -(blocksCount * 4 + 2)) {
      end();
    }
    if (bodyPosition.y < -4) {
      restart();
    }
  });

  return (
    <RigidBody
      ref={body}
      position={[0, 1, 0]}
      canSleep={false}
      restitution={0.2}
      friction={1}
      colliders="ball"
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  );
}
