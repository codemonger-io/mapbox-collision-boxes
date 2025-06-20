import type { QrfQuery, SourceCache, Style, StyleLayer } from './mapbox-types';

/**
 * Makes a default `QrfQuery`s for a given `StyleLayer`.
 *
 * @remarks
 *
 * A tweaked version of the following code block:
 * https://github.com/mapbox/mapbox-gl-js/blob/ed45b275610423e6d3c4716b071cb8e25198a528/src/style/style.ts#L3185-L3196
 *
 * @beta
 */
export function makeQrfQueryForStyleLayer(
  style: Style,
  styleLayer: StyleLayer,
  sourceCache: SourceCache,
) {
  // NOTE: suppose `styleLayer` has features
  // // Skip layers that don't have features.
  // if (featurelessLayerTypes.has(styleLayer.type)) return;

  // NOTE: sourceCache must have been resolved in our context
  // const sourceCache = this.getOwnLayerSourceCache(styleLayer);
  // assert(sourceCache, 'queryable layers must have a source');

  // NOTE: has3DLayers should not matter but retained in case I miss something
  const querySourceCache: QrfQuery & {has3DLayers?: boolean} = {sourceCache, layers: {}, has3DLayers: false};
  if (styleLayer.is3D(!!style.terrain)) querySourceCache.has3DLayers = true;
    querySourceCache.layers[styleLayer.fqid] = querySourceCache.layers[styleLayer.fqid] || {styleLayer, targets: []};
  // NOTE: `targets` must not be empty, otherwise we will get nothing.
  // in the original code, `filter` prop is specified, which is
  // `undefined` in our context.
  // I also applied a non-null assertion to `targets`; I do not know why the
  // original code got no type error.
  querySourceCache.layers[styleLayer.fqid].targets!.push({/*filter*/}); 

  return querySourceCache;
}
