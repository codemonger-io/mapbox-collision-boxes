/**
 * Collision box utility for
 * {@link https://docs.mapbox.com/mapbox-gl-js/guides/|Mapbox GL JS}.
 *
 * @packageDocumentation
 *
 * @beta
 */

import type { Map } from 'mapbox-gl';

import { calculateCollisionBox } from './private/collision-index';
import { getMapboxGlVersion } from './private/mapbox-gl-version';
import type { Style } from './private/mapbox-types';
import { EXTENT, isSymbolBucket } from './private/mapbox-types';
import { waitForPlacement } from './private/placement';
import {
  getSymbolPlacementTileProjectionMatrix,
} from './private/projection-util';
import { evaluateSizeForZoom } from './private/symbol-size';
import type { Box, FeatureBox } from './types';
export type { Box, FeatureBox } from './types';

// placement timeout in milliseconds.
const PLACEMENT_TIMEOUT_IN_MS = 5000;

/**
 * Collects collision boxes on a given Mapbox map layer.
 *
 * @remarks
 *
 * This function waits until the last symbol placement finishes.
 * The wait times out after five seconds.
 *
 * @param map -
 *
 *   {@link https://docs.mapbox.com/mapbox-gl-js/api/map/|Mapbox map} instance.
 *
 * @param layerId -
 *
 *   ID of the layer where collision boxes are to be collected.
 *
 * @returns
 *
 *   Collision boxes and features on the layer associated with `layerId` on
 *   `map`.
 *
 * @throws RangeError
 *
 *   If there is no layer associated with `layerId`, or if the layer associated
 *   with `layerId` is not a symbol layer.
 *
 * @throws Error
 *
 *   If there is an error.
 *
 * @beta
 */
export async function collectCollisionBoxesAndFeatures(
  map: Map,
  layerId: string,
): Promise<FeatureBox[]> {
  const style = map.style as Style;
  const version = getMapboxGlVersion(map);
  const placement = style.placement;
  const layer = style._layers[layerId];
  if (layer == null) {
    throw new RangeError(`no such layer: ${layerId}`);
  }
  if (layer.type !== 'symbol') {
    throw new RangeError(`layer "${layerId}" is not a symbol layer`);
  }
  await waitForPlacement(placement, PLACEMENT_TIMEOUT_IN_MS);
  const sourceCache = version.isV3
    ? style.getOwnLayerSourceCache(layer)
    : style._getLayerSourceCache!(layer);
  if (sourceCache == null) {
    throw new Error(`no SourceCache available`);
  }
  const layerTiles = sourceCache.getRenderableIds(
    true, // symbolLayer?
  ).map(id => sourceCache.getTileByID(id));
  const transform = map.painter.transform;
  const collisionBoxesWithFeature = [];
  for (const tile of layerTiles) {
    const bucket = tile.getBucket(layer);
    if (bucket == null) {
      // tile may not contain any symbols
      continue;
    }
    if (!isSymbolBucket(bucket)) {
      console.warn(`layer "${layerId}" must be associated with a SymbolBucket`);
      continue;
    }
    const posMatrix = getSymbolPlacementTileProjectionMatrix(
      tile.tileID,
      bucket.getProjection(),
      placement.transform,
      placement.projection,
    );
    const textPixelRatio = tile.tileSize / EXTENT;
    const partiallyEvaluatedIconSize =
      evaluateSizeForZoom(bucket.iconSizeData, placement.transform.zoom);
    const featureIndexes = [];
    const featureCollisionBoxes = []; // featureIndex → collision box
    for (let i = 0; i < bucket.symbolInstances.length; ++i) {
      const featureIndex = bucket.symbolInstances.get(i).featureIndex;
      featureIndexes.push(featureIndex);
      // calculates the collision box of the feature
      const { iconBox } = bucket.collisionArrays[i];
      if (iconBox != null) {
        const scale = bucket.getSymbolInstanceIconSize(
          partiallyEvaluatedIconSize,
          placement.transform.zoom,
          i,
        );
        featureCollisionBoxes[featureIndex] = calculateCollisionBox(
          placement,
          tile,
          bucket,
          iconBox,
          posMatrix,
          textPixelRatio,
          scale,
          version,
        );
      }
    }
    const queryData = placement.retainedQueryData[bucket.bucketInstanceId];
    // in v3.8.0 or higher, style no longer has _serializedLayers,
    // and lookupSymbolFeatures takes fewer parameters
    const results = version.isV3_8
      ? queryData.featureIndex.lookupSymbolFeatures(
        featureIndexes,
        queryData.bucketIndex,
        queryData.sourceLayerIndex,
        // NOTE: contrary to the type definition, the following parameter may
        // be `undefined`
        undefined as any, // filterSpec
        [], // filterLayerIDs
        style._availableImages,
        style._layers,
      )
      : queryData.featureIndex.lookupSymbolFeatures(
        featureIndexes,
        style._serializedLayers!,
        queryData.bucketIndex,
        queryData.sourceLayerIndex,
        // NOTE: contrary to the type definition, the following two parameters
        // may be `undefined`
        undefined as any, // filterSpec
        undefined as any, // filterLayerIDs
        style._availableImages,
        style._layers,
      );
    for (const layerResults of Object.values(results)) {
      for (const feature of layerResults) {
        collisionBoxesWithFeature.push({
          box: featureCollisionBoxes[feature.featureIndex],
          feature: feature.feature,
        });
      }
    }
  }
  return collisionBoxesWithFeature;
}

/**
 * Returns if two `Box`es intersect.
 *
 * @param box1 -
 *
 *   Box to be tested.
 *
 * @param box2 -
 *
 *   Another box to be tested.
 *
 * @returns
 *
 *   Whether `box1` and `box2` intersect.
 *
 * @beta
 */
export function boxesIntersect(box1: Box, box2: Box): boolean {
  return box1.tlX < box2.brX &&
    box1.tlY < box2.brY &&
    box2.tlX < box1.brX &&
    box2.tlY < box1.brY;
}
