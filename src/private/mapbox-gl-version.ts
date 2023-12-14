import type { Map } from 'mapbox-gl';

/**
 * Version information on `mapbox-gl`.
 *
 * @beta
 */
export interface MapboxGlVersion {
  /** Whether v3 or later. */
  readonly isV3: boolean;

  /** Whether v2.11.1 or earlier. */
  readonly isLegacy: boolean;
}

/**
 * Obtains {@link MapboxGlVersion} from a given map instance.
 *
 * @beta
 */
export function getMapboxGlVersion(map: Map): MapboxGlVersion {
  const isV3 = typeof map.style.getOwnLayerSourceCache !== 'undefined';
  const isLegacy = typeof map._isDragging === 'undefined';
  return { isV3, isLegacy }
}
