import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { cameraPosition, playerPosition } from "../../../state/positions";
import { numLerp } from "../../../utils/numbers";
import { useEnemiesInRange, usePlayerHasTarget } from "../../../state/player";
import { useIsPortrait } from "../../../utils/responsive";

const data = {
  atRest: true,
  atRestTimestamp: 0,
  previousXDiff: 0,
  previousYDiff: 0,
};

const useAllowedMovementOffset = (): [number, number] => {
  const portrait = useIsPortrait();
  return portrait ? [1.5, 3] : [3.5, 2.5];
};

const useCameraOffset = (): [y: number, z: number, x: number] => {
  const portrait = useIsPortrait();
  return portrait ? [100, 100, 100] : [75, 75, 75];
};

const useCameraShadowBounds = (
  portrait: boolean
): [left: number, right: number, top: number, bottom: number] => {
  if (portrait) {
    return [75, 130, -10, 50];
  }
  return [0, 100, -10, 50];
};

const Camera: React.FC = () => {
  const ref = useRef<any>();
  const targetLocked = usePlayerHasTarget();
  const inDanger = useEnemiesInRange();
  const [allowedX, allowedY] = useAllowedMovementOffset();
  const [cameraYOffset, cameraZOffset, cameraXOffset] = useCameraOffset();
  const portrait = useIsPortrait();
  const [shadowLeft, shadowRight, shadowTop, shadowBottom] =
    useCameraShadowBounds(portrait);

  useFrame(() => {
    if (!ref.current) return;

    const camera = ref.current;
    const { x, z: y } = camera.position;

    let newX = x;
    let newY = y;

    const isTargetLocked = targetLocked;

    const playerXDiff = Math.round(
      (playerPosition.x - playerPosition.previousX) *
        (isTargetLocked ? 2500 : 5000)
    );
    const playerYDiff = Math.round(
      (playerPosition.y - playerPosition.previousY) *
        (isTargetLocked ? 2500 : 5000)
    );

    const moving = playerYDiff !== 0 || playerXDiff !== 0;

    const cameraXDiff = x - playerPosition.x + cameraXOffset;
    const cameraYDiff = y - playerPosition.y + cameraZOffset;

    let movedSufficiently =
      inDanger ||
      !data.atRest ||
      Math.abs(cameraXDiff) > allowedX ||
      Math.abs(cameraYDiff) > allowedY ||
      Math.abs(playerXDiff) > 500 ||
      Math.abs(playerYDiff) > 500;

    if (movedSufficiently) {
      const adjustedXDiff = numLerp(playerXDiff, data.previousXDiff, 0.9);
      const adjustedYDiff = numLerp(playerYDiff, data.previousYDiff, 0.9);

      if (adjustedXDiff === 0 && adjustedYDiff === 0) {
        // todo...
      }

      data.previousXDiff = adjustedXDiff;
      data.previousYDiff = adjustedYDiff;

      newX = playerPosition.x + adjustedXDiff * 0.01 - cameraXOffset;
      newY = playerPosition.y + adjustedYDiff * 0.01 - cameraZOffset;
    }

    if (isTargetLocked) {
      newX = numLerp(newX, playerPosition.targetX - cameraXOffset, 0.33);
      newY = numLerp(newY, playerPosition.targetY - cameraZOffset, 0.33);
    }

    let xDiff = Math.abs(x - newX);
    let yDiff = Math.abs(y - newY);

    if (x !== newX || y !== newY) {
      camera.position.x = numLerp(x, newX, 0.05);
      camera.position.z = numLerp(y, newY, 0.05);

      cameraPosition.previousX = x;
      cameraPosition.previousY = y;
    }

    // not at rest if camera moving, or camera was moving and player is still moving

    if (
      xDiff > 0.05 ||
      yDiff > 0.05 ||
      (!data.atRest && moving) ||
      isTargetLocked
    ) {
      data.atRest = false;
      data.atRestTimestamp = 0;
    } else {
      if (!data.atRest) {
        if (!data.atRestTimestamp) {
          data.atRestTimestamp = Date.now() + 250;
        } else if (Date.now() > data.atRestTimestamp) {
          data.atRest = true;
        }
      }
    }
  });

  return (
    <perspectiveCamera
      ref={ref}
      fov={10}
      position={[-cameraXOffset, cameraYOffset, -cameraZOffset]}
      near={100}
      far={250}
    >
      <directionalLight
        intensity={100}
        position={[cameraXOffset, cameraYOffset + 1, cameraZOffset + 100]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      {/*{light.current && <directionalLightHelper args={[light.current, 5]}/>}*/}
    </perspectiveCamera>
  );
};

export default Camera;
