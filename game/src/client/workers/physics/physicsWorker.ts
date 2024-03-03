/* eslint-disable no-restricted-globals */

import { WorkerMessageType, WorkerOwnerMessageType } from "./types";
import { initPhysicsListeners, stepWorld } from "../../physics/world";
import { syncBodies } from "./functions";
import { addBody, removeBody, setBody, updateBody } from "../../physics/bodies";
import { dynamicBodiesUuids, unsyncedBodies } from "../../shared";

const selfWorker = self as unknown as Worker;

const init = () => {
  syncBodies();
  initPhysicsListeners();
};

init();

const step = (positions: Float32Array, angles: Float32Array) => {
  stepWorld(positions, angles);

  const data: any = {
    type: WorkerOwnerMessageType.FRAME,
    positions,
    angles,
  };

  if (unsyncedBodies) {
    data["bodies"] = dynamicBodiesUuids;
  }

  selfWorker.postMessage(data, [positions.buffer, angles.buffer]);
};

self.onmessage = (event: MessageEvent) => {
  const { type, props = {} } = event.data as {
    type: WorkerMessageType;
    props: any;
  };
  switch (type) {
    case WorkerMessageType.STEP:
      const { positions, angles } = event.data;
      step(positions, angles);
      break;
    case WorkerMessageType.ADD_BODY:
      addBody(props);
      break;
    case WorkerMessageType.REMOVE_BODY:
      removeBody(props);
      break;
    case WorkerMessageType.SET_BODY:
      setBody(props);
      break;
    case WorkerMessageType.UPDATE_BODY:
      updateBody(props);
      break;
  }
};

export {};
