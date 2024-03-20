/*
auto-generated by: https://github.com/pmndrs/gltfjsx
*/
import React, { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

export default function Wall(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<Group>(null);
  const { nodes, materials, scene } = useGLTF("/wall.gltf.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group userData={{ name: "wall" }}>
        <primitive
          material={materials.Stone}
          object={clone}
          receiveShadow
          position={[0.0001, 0.0001, 0.0001]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/wall.gltf.glb");
