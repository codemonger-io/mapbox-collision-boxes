import { mat4 } from 'gl-matrix';

import { Box } from '../types';
import type { MapboxGlVersion } from './mapbox-gl-version';
import {
  Placement,
  SingleCollisionBox,
  SymbolBucket,
  Tile,
} from './mapbox-types';

/**
 * Mocks `CollisionIndex#placeCollisionBox`.
 *
 * @remarks
 *
 * This function mocks the collision box calculation of
 * `CollisionIndex#placeCollisionBox`.
 * https://github.com/mapbox/mapbox-gl-js/blob/922da6dd02dbcc1ccd852cebba8b830a070d46ca/src/symbol/collision_index.js#L90-L140
 *
 * @param version
 *
 *   Version information of `mapbox-gl`.
 *
 * @beta
 */
export function calculateCollisionBox(
  placement: Placement,
  tile: Tile,
  bucket: SymbolBucket,
  box: SingleCollisionBox,
  posMatrix: mat4,
  textPixelRatio: number,
  scale: number,
  version: MapboxGlVersion,
): Box {
  // we assumes symbols do not have a text.
  // so `shift` is `(0, 0)`.
  const shift = { x: 0, y: 0 };
  const { collisionIndex } = placement;
  let anchorX = box.projectedAnchorX;
  let anchorY = box.projectedAnchorY;
  let anchorZ = box.projectedAnchorZ;
  const { elevation, tileID } = box;
  const projection = bucket.getProjection()
  if (elevation && tileID) {
    const [ux, uy, uz] = projection
      .upVector(tileID.canonical, box.tileAnchorX, box.tileAnchorY);
    const upScale = projection
      .upVectorScale(
        tileID.canonical,
        collisionIndex.transform.center.lat,
        collisionIndex.transform.worldSize,
      )
      .metersToTile;
    anchorX += ux * elevation * upScale;
    anchorY += uy * elevation * upScale;
    anchorZ += uz * elevation * upScale;
  }
  const checkOcclusion =
    bucket.projection.name === 'globe' ||
    !!elevation ||
    collisionIndex.transform.pitch > 0;
  const projectedPoint = version.isLegacy
    ? collisionIndex.projectAndGetPerspectiveRatio(
      posMatrix,
      [anchorX, anchorY, anchorZ],
      box.tileID,
      checkOcclusion,
      bucket.getProjection(),
    )
    : collisionIndex.projectAndGetPerspectiveRatio(
      posMatrix,
      anchorX,
      anchorY,
      anchorZ,
      box.tileID,
      checkOcclusion,
      bucket.getProjection(),
    );
  const tileToViewport = textPixelRatio * projectedPoint.perspectiveRatio;
  const screenX = projectedPoint.point.x;
  const screenY = projectedPoint.point.y;
  const tlX =
    (box.x1 * scale + shift.x - box.padding) * tileToViewport + screenX;
  const tlY =
    (box.y1 * scale + shift.y - box.padding) * tileToViewport + screenY;
  const brX =
    (box.x2 * scale + shift.x + box.padding) * tileToViewport + screenX;
  const brY =
    (box.y2 * scale + shift.y + box.padding) * tileToViewport + screenY;
  return {
    tlX,
    tlY,
    brX,
    brY,
  };
}
