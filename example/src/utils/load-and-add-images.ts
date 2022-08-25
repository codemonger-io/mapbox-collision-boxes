import type { Map } from 'mapbox-gl';

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
  await Promise.all(Object.keys(imagePaths).map(imageId => {
    return loadAndAddImage(map, imageId, imagePaths[imageId]);
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
      } else if (image == null) {
        reject(new Error('no image is loaded'));
      } else {
        if (!map.hasImage(imageId)) {
          map.addImage(imageId, image);
        }
        resolve();
      }
    });
  });
}
