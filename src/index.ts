import { Map } from 'mapbox-gl';

import { calculateCollisionBox } from './private/collision-index';
import { EXTENT, isSymbolBucket } from './private/mapbox-types';
import {
  getSymbolPlacementTileProjectionMatrix,
} from './private/projection-util';
import { evaluateSizeForZoom } from './private/symbol-size';
import { FeatureBox } from './types';
export { FeatureBox } from './types';

/**
 * Collects collision boxes on a given Mapbox map layer.
 *
 * @param map -
 *
 *   Mapbox map instance.
 *
 * @param layerId -
 *
 *   ID of the layer where collision boxes are to be collected.
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
  const style = map.style;
  const placement = style.placement;
  const layer = style._layers[layerId];
  if (layer == null) {
    throw new RangeError(`no such layer: ${layerId}`);
  }
  if (layer.type !== 'symbol') {
    throw new RangeError(`layer "${layerId}" is not a symbol layer`);
  }
  const sourceCache = style._getLayerSourceCache(layer);
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
        );
      }
    }
    const queryData = placement.retainedQueryData[bucket.bucketInstanceId];
    const results = queryData.featureIndex.lookupSymbolFeatures(
      featureIndexes,
      style._serializedLayers,
      queryData.bucketIndex,
      queryData.sourceLayerIndex,
      undefined, // filterSpec
      undefined, // filterLayerIDs
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
