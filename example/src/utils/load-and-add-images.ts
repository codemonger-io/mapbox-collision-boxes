import { Map } from 'mapbox-gl';

/**
 * Loads and adds images.
 *
 * @param map -
 *
 *   Map instance to load images.
 *
 * @param imagePaths -
 *
 *   Maps an image ID to the path to the image.
 */
export async function loadAndAddImages(
  map: Map,
  imagePaths: { [imageId: string]: string },
): Promise<void> {
  return Promise.all(Object.entries(imagePaths).map(([imageId, imagePath]) => {
    return loadAndAddImage(map, imageId, imagePath);
  }));
}

// loads and adds a single image.
async function loadAndAddImage(
  map: Map,
  imageId: string,
  imagePath: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    map.loadImage(imagePath, (err, image) => {
      if (err != null) {
        reject(err);
      } else {
        if (!map.hasImage(imageId)) {
          map.addImage(imageId, image);
        }
        resolve();
      }
    });
  });
}
