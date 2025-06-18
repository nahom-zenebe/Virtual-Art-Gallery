import * as THREE from "three";
import {
  displayPaintingInfo,
  hidePaintingInfo,
  getIsInfoLocked,
  getLockedPainting,
} from "./paintingInfo.js";
import { updateMovement } from "./movement.js";
import { updateStatueRotations } from "./statue.js";

export const setupRendering = (
  scene,
  camera,
  renderer,
  paintings,
  controls,
  walls
) => {
  const clock = new THREE.Clock();

  let render = function () {
    const delta = clock.getDelta();

    updateMovement(delta, controls, camera, walls);
    
    // Update statue rotations
    updateStatueRotations(delta);

    const distanceThreshold = 8;

    let paintingToShow = null;
    paintings.forEach((painting) => {
      const distanceToPainting = camera.position.distanceTo(painting.position);
      if (distanceToPainting < distanceThreshold) {
        paintingToShow = painting;
      }
    });

    const isInfoLocked = getIsInfoLocked();
    const lockedPainting = getLockedPainting();

    if (isInfoLocked && lockedPainting !== paintingToShow) {
      hidePaintingInfo(paintingToShow);
    }

    if (!isInfoLocked) {
      if (paintingToShow) {
        displayPaintingInfo({
          title: "Click the image to see the description",
          artist: "",
          description: "",
          year: "",
        });
      } else {
        hidePaintingInfo();
      }
    }

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  render();
};
