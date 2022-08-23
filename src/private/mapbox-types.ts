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

import { mat4, vec3 } from 'gl-matrix';
import { LngLat, Map, Style } from 'mapbox-gl';

import { SizeData } from './symbol-size';
import { QueryFeature } from '../types';

declare module 'mapbox-gl' {
  interface Map {
    // @rollup/plugin-typescript warns about the use of a private type `Style`,
    // but it should not matter because this augmentation is private anyway
    style: Style;
    painter: Painter;
  }

  interface Style {
    placement: Placement;
    _layers: { [layerId: string]: StyleLayer };
    // a value of _serialiedLayers is `Object` in `mapbox-gl`
    // but it is actually given to lookupSymbolFeatures where a `StyleLayer` is
    // required.
    _serializedLayers: { [layerId: string]: StyleLayer };
    _availableImages: string[];

    _getLayerSourceCache(layer: StyleLayer): SourceCache | undefined;
  }
}

export const EXTENT = 8192;

export interface StyleLayer {
  type: string;
}

export interface Placement {
  projection: string;
  transform: Transform;
  collisionIndex: CollisionIndex;
  stale: boolean;
  retainedQueryData: {[bucketInstanceId: number]: RetainedQueryData};
}

export interface CollisionIndex {
  transform: Transform;

  projectAndGetPerspectiveRatio(
    posMatrix: mat4,
    point: vec3,
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
    availableImages: string[],
    styleLayers: { [layerId: string]: StyleLayer },
  ): QueryResult
}

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
  ): Float64Array;
  upVector(id: CanonicalTileID, x: number, y: number): vec3;
  upVectorScale(id: CanonicalTileID, latitude: number, worldSize: number): EvaluationScale;
}

export interface EvaluationScale {
  metersToTile: number;
}

export interface Transform {
  // original type of `projMatrix` is `number[]`,
  // but replacing it with `mat4` should not harm within this library.
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
