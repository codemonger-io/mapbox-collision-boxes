import { mat4 } from 'gl-matrix';

import { OverscaledTileID, Projection, Transform } from './mapbox-types';

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
// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/geo/projection/projection_util.js#L9-L15
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
    // `tileMatrix` is `Float64Array` while `multiply` requires `Float32Array`.
    // forceful reinterpretation of `tileMatrix` should not be a problem
    // because `mapbox-gl` implicitly does it.
    (tileMatrix as unknown) as Float32Array,
  );
}
