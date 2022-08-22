import { MapboxGeoJSONFeature } from 'mapbox-gl';

/**
 * Box in the screen coordinate.
 *
 * @beta
 */
export interface Box {
  /** X-coordinate value of the top-left corner of the box. */
  tlX: number;
  /** Y-coordinate value of the top-left corner of the box. */
  tlY: number;
  /** X-coordinate value of the bottom-right corner of the box. */
  brX: number;
  /** Y-coordinate value of the bottom-right corner of the box. */
  brY: number;
}

/**
 * Box with feature information.
 *
 * @beta
 */
export interface FeatureBox {
  /** Box of the feature. */
  box: Box;
  /** Feature. */
  feature: QueryFeature;
}

/**
 * Feature.
 *
 * @remarks
 *
 * `QueryFeature` is defined in https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/util/vectortile_to_geojson.js#L6-L9
 *
 * `QueryFeature` is exported as `MapboxGeoJSONFeature` from `@types/mapbox-gl`.
 *
 * @beta
 */
export type QueryFeature = MapboxGeoJSONFeature;
