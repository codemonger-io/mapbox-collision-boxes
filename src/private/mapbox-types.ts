/**
 * Augments types of `mapbox-gl`.
 *
 * @remarks
 *
 * Conforms to `mapbox-gl` v2.9.2.
 *
 * Includes only minimal definitions necessary to implement this library.
 *
 * @beta
 */

import type { mat4, vec3 } from 'gl-matrix';
import type { LngLat, Map } from 'mapbox-gl';

import type { SizeData } from './symbol-size';
import type { QueryFeature } from '../types';

export const EXTENT = 8192;

type MapboxStyle = Map['style'];

export type Style = MapboxStyle & {
  placement: Placement;

  // v3.7.0 or earlier
  _serializedLayers?: { [layerId: string]: StyleLayer };

  // v2
  _getLayerSourceCache?: (layer: StyleLayer) => SourceCache | undefined;
}

// there is no `ImageId` but `string` in v3.10.0 or earlier,
// however actual type of `ImageId` won't matter,
// because it is a placeholder to suppress type errors
export type ImageId = Style['_availableImages'][number];

export type StyleLayer = MapboxStyle['_layers'][string] & {
  // v3.11.0 or later may take a parameter
  is3D(terrainEnabled?: boolean): boolean;
};

export type Placement = MapboxStyle['placement'] & {
  transform: Transform;
  collisionIndex: CollisionIndex;
  retainedQueryData: {[bucketInstanceId: number]: RetainedQueryData};
}

export interface CollisionIndex {
  transform: Transform;

  // v2.11.1 or earlier
  projectAndGetPerspectiveRatio(
    posMatrix: mat4,
    point: vec3,
    tileID: OverscaledTileID | undefined | null,
    checkOcclusiion: boolean,
    bucketProjection: Projection,
  ): ScreenAnchorPoint;
  // v2.12.0 or later
  projectAndGetPerspectiveRatio(
    posMatrix: mat4,
    x: number,
    y: number,
    z: number,
    tileID: OverscaledTileID | undefined | null,
    checkOcclusiion: boolean,
    bucketProjection: Projection,
  ): ScreenAnchorPoint;
}

export type ScreenAnchorPoint = {
  perspectiveRatio: number,
  point: Point,
};

// `Point` is defined in `@mapbox/point-geometry` but the following definition
// is sufficient for this library.
export type Point = {
  x: number,
  y: number,
};

export interface RetainedQueryData {
  featureIndex: FeatureIndex;
  sourceLayerIndex: number;
  bucketIndex: number;
}

export interface SourceCache {
  getRenderableIds(symbolLayer?: boolean): number[];
  getTileByID(id: number): Tile;
}

export interface FeatureIndex {
  // v3.7.0 or earlier
  lookupSymbolFeatures(
    symbolFeatureIndexes: number[],
    serializedLayers: { [layerId: string]: StyleLayer },
    bucketIndex: number,
    sourceLayerIndex: number,
    // original definition of `filterSpec` is complicated `FilterSpecification`
    // that I wanted to avoid to redefine.
    // this should not matter to this library.
    // may be `undefined` or `null` in effect
    filterSpec: any,
    // original definition of `filterLayerIDs` is `string[]`,
    // but may be `undefined` or `null` in effect
    filterLayerIDs: string[] | undefined | null,
    availableImages: ImageId[],
    styleLayers: { [layerId: string]: StyleLayer },
  ): QueryResult
  // v3.8.0
  lookupSymbolFeatures(
    symbolFeatureIndexes: number[],
    bucketIndex: number,
    sourceLayerIndex: number,
    // original definition of `filterSpec` is complicated `FilterSpecification`
    // that I wanted to avoid to redefine.
    // this should not matter to this library.
    // may be `undefined` or `null` in effect
    filterSpec: any,
    // since v3.8.0, `filterLayerIDs` must not be `undefined` or `null`
    filterLayerIDs: string[],
    availableImages: ImageId[],
    styleLayers: { [layerId: string]: StyleLayer },
  ): QueryResult
  // v3.9.0 or later
  lookupSymbolFeatures(
    symbolFeatureIndexes: number[],
    bucketIndex: number,
    sourceLayerIndex: number,
    query: QrfQuery,
    availableImages: ImageId[],
  ): QueryResult;
}

// https://github.com/mapbox/mapbox-gl-js/blob/ed45b275610423e6d3c4716b071cb8e25198a528/src/source/query_features.ts#L19-L22
export type QrfQuery = {
  layers: QrfLayers;
  sourceCache: SourceCache;
};

// https://github.com/mapbox/mapbox-gl-js/blob/ed45b275610423e6d3c4716b071cb8e25198a528/src/source/query_features.ts#L27
export type QrfLayers = Record<string, QrfLayer>;

export type QrfLayer = {
  targets?: unknown[]; // actual element type is `QrfTarget` but won't matter
  styleLayer: StyleLayer; // actual type is `TypedStyleLayer` but won't matter
};

export type QueryResult = {
  [layerId: string]: ({
    featureIndex: number;
    feature: QueryFeature;
  })[],
};

export interface Tile {
  tileID: OverscaledTileID;
  tileSize: number;
  getBucket(layer: StyleLayer): Bucket;
}

export interface CanonicalTileID {
}

export interface UnwrappedTileID {
}

export interface OverscaledTileID {
  canonical: CanonicalTileID;
  toUnwrapped(): UnwrappedTileID;
}

export interface Painter {
  transform: Transform;
}

export interface ProjectionSpecification {
  // `name` should be a union of strings but should not matter here
  name: string;
}

export interface Projection {
  name: string;

  createTileMatrix(
    tr: Transform,
    worldSize: number,
    id: UnwrappedTileID,
  ): mat4;
  upVector(id: CanonicalTileID, x: number, y: number): vec3;
  upVectorScale(id: CanonicalTileID, latitude: number, worldSize: number): EvaluationScale;
}

export interface EvaluationScale {
  metersToTile: number;
}

export interface Transform {
  // `projMatrix` is `mat4` since `mapbox-gl` v3.8.0
  // should not harm the older versions of `mapbox-gl`
  projMatrix: mat4;
  projection: Projection;
  center: LngLat;
  pitch: number;
  worldSize: number;
  zoom: number;

  calculateProjMatrix(
    unwrappedTileID: UnwrappedTileID,
    aligned?: boolean,
  ): Float32Array;
}

export interface Bucket {
}

export interface SymbolBucket extends Bucket {
  bucketInstanceId: number;
  iconSizeData: SizeData;
  symbolInstances: SymbolInstanceArray;
  collisionArrays: CollisionArray[];
  projection: ProjectionSpecification;

  getProjection(): Projection;
  getSymbolInstanceIconSize(iconSize: any, zoom: number, index: number): number;
}

export interface SymbolInstanceArray {
  length: number;
  get(i: number): SymbolInstanceStruct;
}

export interface SymbolInstanceStruct {
  featureIndex: number;
}

export interface CollisionArray {
  iconBox?: SingleCollisionBox;
}

export interface SingleCollisionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  padding: number;
  projectedAnchorX: number;
  projectedAnchorY: number;
  projectedAnchorZ: number;
  tileAnchorX: number;
  tileAnchorY: number;
  elevation?: number;
  tileID?: OverscaledTileID;
}

/**
 * Returns if a given `Bucket` is a `SymbolBucket`.
 *
 * @remarks
 *
 * This is a TypeScript custom guard for `SymbolBucket`.
 *
 * @param bucket -
 *
 *   Bucket to be tested.
 *
 * @return -
 *
 *   Whether `bucket` is a `SymbolBucket` or not.
 *
 * @beta
 */
export function isSymbolBucket(bucket: Bucket): bucket is SymbolBucket {
  return (bucket as SymbolBucket).symbolInstances !== undefined;
}
