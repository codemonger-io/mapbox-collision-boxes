/**
 * Mocks calculation of a symbol size.
 *
 * @beta
 */

import UnitBezier from '@mapbox/unitbezier';

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/style-spec/expression/definitions/interpolate.js#L17-L20
type InterpolationType = {
  name: 'linear',
} | {
  name: 'exponential',
  base: number,
} | {
  name: 'cubic-bezier',
  controlPoints: [number, number, number, number],
};

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/symbol_size.js#L15-L32
export type SizeData = {
  kind: 'constant',
  layoutSize: number,
} | {
  kind: 'source',
} | {
  kind: 'camera',
  minZoom: number,
  maxZoom: number,
  minSize: number,
  maxSize: number,
  interpolationType: InterpolationType | undefined | null,
} | {
  kind: 'composite',
  minZoom: number,
  maxZoom: number,
  interpolationType: InterpolationType | undefined | null,
};

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/symbol_size.js#L34-L37
type InterpolatedSize = {
  uSize: number,
  uSizeT: number,
};

/**
 * Mocks `evaluateSizeForSymbol`.
 *
 * @remarks
 *
 * Clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/symbol_size.js#L92-L118
 *
 * @beta
 */
export function evaluateSizeForZoom(
  sizeData: SizeData,
  zoom: number,
): InterpolatedSize {
  let uSizeT = 0;
  let uSize = 0;
  if (sizeData.kind === 'constant') {
    uSize = sizeData.layoutSize;
  } else if (sizeData.kind !== 'source') {
    const { interpolationType, minZoom, maxZoom } = sizeData;
    const t = !interpolationType ? 0 : clamp(
      interpolationFactor(interpolationType, zoom, minZoom, maxZoom),
      0,
      1,
    );
    if (sizeData.kind === 'camera') {
      uSize = interpolate(sizeData.minSize, sizeData.maxSize, t);
    } else {
      uSizeT = t;
    }
  }
  return { uSizeT, uSize };
}

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/util/util.js#L211-L213
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/style-spec/expression/definitions/interpolate.js#L45-L57
function interpolationFactor(
  interpolation: InterpolationType,
  input: number,
  lower: number,
  upper: number,
): number {
  let t = 0;
  if (interpolation.name === 'exponential') {
      t = exponentialInterpolation(input, interpolation.base, lower, upper);
  } else if (interpolation.name === 'linear') {
      t = exponentialInterpolation(input, 1, lower, upper);
  } else if (interpolation.name === 'cubic-bezier') {
      const c = interpolation.controlPoints;
      const ub = new UnitBezier(c[0], c[1], c[2], c[3]);
      t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
  }
  return t;
}

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/style-spec/util/interpolate.js#L5-L7
function interpolate(a: number, b: number, t: number): number {
  return (a * (1 - t)) + (b * t);
}

// clone of https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/style-spec/expression/definitions/interpolate.js#L255-L266
function exponentialInterpolation(
  input: number,
  base: number,
  lowerValue: number,
  upperValue: number,
): number {
  const difference = upperValue - lowerValue;
  const progress = input - lowerValue;
  if (difference === 0) {
    return 0;
  } else if (base === 1) {
    return progress / difference;
  } else {
    return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
  }
}
