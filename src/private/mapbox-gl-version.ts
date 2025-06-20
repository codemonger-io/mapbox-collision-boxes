import type { Map } from 'mapbox-gl';

import type { Style } from './mapbox-types';

/**
 * Version information on `mapbox-gl`.
 *
 * @beta
 */
export interface MapboxGlVersion {
  /**
   * Whether v3 or later.
   *
   * @remarks
   *
   * `true`: `Style` has `getOwnLayerSourceCache`.
   *
   * `false`: `Style` has `_getLayerSourceCache` instead.
   */
  readonly isV3: boolean;

  /**
   * Whether v3.8.0 or later.
   *
   * @remarks
   *
   * `true`: `FeatureIndex.lookupSymbolFeatures` takes 7 parameters.
   * `isV3_9` preceeds.
   *
   * `false`: `FeatureIndex.lookupSymbolFeatures` takes 8 parameters.
   */
  readonly isV3_8: boolean;

  /**
   * Whether v3.9.0 or later.
   *
   * @remarks
   *
   * `true`: `FeatureIndex.lookupSymbolFeatures` takes `QrfQuery` instead of
   * `filterSpec` and `filterLayerIDs`.
   *
   * `false`: see `isV3_8`.
   */
  readonly isV3_9: boolean;

  /**
   * Whether v2.11.1 or earlier.
   *
   * @remarks
   *
   * `true`: `CollisionIndex.projectAndGetPerspectiveRatio` takes 5 parameters.
   *
   * `false`: `CollisionIndex.projectAndGetPerspectiveRatio` takes 7 parameters.
   */
  readonly isLegacy: boolean;
}

/**
 * Obtains {@link MapboxGlVersion} from a given map instance.
 *
 * @beta
 */
export function getMapboxGlVersion(map: Map): MapboxGlVersion {
  const isV3 = typeof map.style.getOwnLayerSourceCache !== 'undefined';
  const isV3_8 = typeof (map.style as Style)._serializedLayers === 'undefined';
  const isV3_9 = typeof map.indoor !== 'undefined';
  const isLegacy = typeof map._isDragging === 'undefined';
  return { isV3, isV3_8, isV3_9, isLegacy }
}
