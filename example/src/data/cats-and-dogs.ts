import { LngLat } from 'mapbox-gl';
import { Feature, FeatureCollection } from 'geojson';

/**
 * Randomly generates cats and dogs around a given point.
 *
 * @param center -
 *
 *   Point where cats and dogs are generated around.
 *
 * @param count -
 *
 *   How many cats and dogs are generated in total.
 */
export function generateCatsAndDogs(
  center: LngLat,
  count: number,
): FeatureCollection {
  const spread = 0.015; // lon / lat ± spread
  const randomSpread = () => (Math.random() - 0.5) * 2 * spread;
  const catOrDog = () => Math.random() >= 0.5 ? 'cat' : 'dog';
  const features: Feature[] = [];
  for (let i = 0; i < count; ++i) {
    const coordinates = [
      center.lon + randomSpread(),
      center.lat + randomSpread(),
    ];
    features.push({
      type: 'Feature',
      id: i,
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties: {
        type: catOrDog(),
      },
    });
  }
  return {
    type: 'FeatureCollection',
    features,
  };
}
