<template>
  <div class="layer-container">
    <div ref="mapContainer" class="map-container"></div>
    <div class="overlay-container">
      <TheOverlay
        :selected-feature="selectedFeature"
        :hidden-features="hiddenFeatures"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import mapboxgl from 'mapbox-gl';
import {
  FeatureBox,
  boxesIntersect,
  collectCollisionBoxesAndFeatures,
} from 'mapbox-collision-boxes';

import { MAPBOX_ACCESS_TOKEN } from '../mapbox-config';
import catPng from '../assets/cat.png';
import dogPng from '../assets/dog.png';
import { generateCatsAndDogs } from '../data/cats-and-dogs';
import { loadAndAddImages } from '../utils/load-and-add-images';

import TheOverlay from './TheOverlay.vue';

const catsAndDogsData = generateCatsAndDogs(
  { lon: 139.7671, lat: 35.6812 }, // Tokyo station
  200, // 200 cats and dogs
);

const mapContainer = ref<HTMLElement>(null);

const selectedFeature = ref<FeatureBox>(null);
const hiddenFeatures = ref<FeatureBox[]>([]);
function resetFeatures() {
  selectedFeature.value = null;
  hiddenFeatures.value = [];
}

onMounted(() => {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [139.7671, 35.6812], // Tokyo station
    zoom: 14,
  });
  map.on('load', async () => {
    // loads cat, and dog icons
    await loadAndAddImages(map, {
      cat: catPng,
      dog: dogPng,
    });
    // adds a source and layer for cats and dogs
    map.addSource('cats-and-dogs', {
      type: 'geojson',
      data: catsAndDogsData,
    });
    map.addLayer({
      id: 'cats-and-dogs',
      type: 'symbol',
      source: 'cats-and-dogs',
      layout: {
        'icon-image': ['get', 'type'],
        'icon-size': 0.25,
      },
    });
    const layerId = 'cats-and-dogs';
    map.on('click', layerId, async e => {
      const clickedFeatureId = e.features[0].id;
      const collisionBoxes =
        await collectCollisionBoxesAndFeatures(map, layerId);
      const clickedBox =
        collisionBoxes.find(box => box.feature.id === clickedFeatureId);
      console.log('clicked box', clickedBox);
      selectedFeature.value = clickedBox;
      const intersectingBoxes = collisionBoxes.filter(
        box => box !== clickedBox && boxesIntersect(clickedBox.box, box.box),
      );
      console.log('hidden boxes', intersectingBoxes);
      hiddenFeatures.value = intersectingBoxes;
    });
    map.on('move', () => {
      resetFeatures();
    });
  });
});
</script>

<style scoped>
.layer-container {
  position: relative;
  width: var(--my-container-width);
  height: var(--my-container-height);
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--my-container-width);
  height: var(--my-container-height);
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--my-container-width);
  height: var(--my-container-height);
  pointer-events: none;
}
</style>
