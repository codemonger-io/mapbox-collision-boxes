/**
 * Utilities for `Projection`.
 *
 * @remarks
 *
 * All the code in this file is a modified copy of the source code of
 * `mapbox-gl`. Be aware of the Mapbox Web SDK license:
 * https://github.com/mapbox/mapbox-gl-js?tab=readme-ov-file#license
 *
 * @beta
 */

import { mat4 } from 'gl-matrix';

import type { OverscaledTileID, Projection, Transform } from './mapbox-types';

/**
 * Mocks `getSymbolPlacementTileProjectionMatrix`.
 *
 * @remarks
 *
 * The original return type is `Float32Array` but a more general `mat4` should
 * be fine.
 *
 * https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/geo/projection/projection_util.js#L35-L41
 */
export function getSymbolPlacementTileProjectionMatrix(
  coord: OverscaledTileID,
  bucketProjection: Projection,
  transform: Transform,
  runtimeProjection: string,
): mat4 {
  if (bucketProjection.name === runtimeProjection) {
    return transform.calculateProjMatrix(coord.toUnwrapped());
  }
  return reconstructTileMatrix(transform, bucketProjection, coord);
}

// mocks reconstructTileMatrix.
// clone of https://github.com/mapbox/mapbox-gl-js/blob/9d8f6b2731743c45f19ee8d9d0650e96ce3d3466/src/geo/projection/projection_util.ts#L9-L15
function reconstructTileMatrix(
  transform: Transform,
  projection: Projection,
  coord: OverscaledTileID,
): mat4 {
  const tileMatrix = projection.createTileMatrix(
    transform,
    transform.worldSize,
    coord.toUnwrapped(),
  );
  return mat4.multiply(
    new Float32Array(16),
    transform.projMatrix,
    tileMatrix,
  );
}
