<template>
  <div ref="container" class="overlay-container">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      :width="width"
      :height="height"
    >
      <rect
        v-for="feature in hiddenFeatures"
        :key="`hidden-box-${feature.feature.id}`"
        :x="feature.box.tlX - viewportPadding"
        :y="feature.box.tlY - viewportPadding"
        :width="feature.box.brX - feature.box.tlX"
        :height="feature.box.brY - feature.box.tlY"
        stroke="red"
        fill="none"
      />
      <rect
        v-if="selectedFeature != null"
        :x="selectedFeature.box.tlX - viewportPadding"
        :y="selectedFeature.box.tlY - viewportPadding"
        :width="selectedFeature.box.brX - selectedFeature.box.tlX"
        :height="selectedFeature.box.brY - selectedFeature.box.tlY"
        stroke="blue"
        fill="none"
      />
    </svg>
    <div class="stats-container" :class="statsContainerClass">
      <section v-if="selectedFeature != null">
        <h5 class="title-selected">Selected</h5>
        <p>
          {{selectedFeature.feature.properties.type}}
          (ID={{selectedFeature.feature.id}})
        </p>
      </section>
      <section v-if="hiddenFeatures.length > 0">
        <h5 class="title-hidden">Hidden</h5>
        <p
          v-for="feature in hiddenFeatures"
          :key="`hidden-feature-${feature.feature.id}`"
        >
          {{feature.feature.properties.type}}
          (ID={{feature.feature.id}})
        </p>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onBeforeUnmount, onMounted } from 'vue';
import { FeatureBox } from 'mapbox-collision-boxes';

// https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/collision_index.js#L50
const viewportPadding = 100;

const props = defineProps<{
  selectedFeature?: FeatureBox,
  hiddenFeatures: FeatureBox[],
}>();

const container = ref<HTMLElement>(null);

onMounted(() => {
  container.value.addEventListener('resize', onResize);
  updateSize();
});

onBeforeUnmount(() => {
  container.value.removeEventListener('resize', onResize);
});

function onResize() {
  updateSize();
}

const width = ref(300);
const height = ref(200);

function updateSize() {
  const clientRect = container.value.getBoundingClientRect();
  width.value = clientRect.width;
  height.value = clientRect.height;
}

const statsContainerClass = computed(() => {
  const isEmpty =
    props.selectedFeature == null &&
    props.hiddenFeatures?.length === 0;
  return {
    'is-empty': isEmpty,
  };
});
</script>

<style scoped>
.overlay-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.stats-container {
  --border-color: #5c5c5c;

  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 100%;
  padding: 5px;
  color: black;
  background-color: white;
  border-left: 1px solid var(--border-color);
  box-shadow: 0px 0px 5px 0px var(--border-color);
  transition: right 0.3s ease-in-out;
  overflow-y: auto;
  pointer-events: auto;
}

.stats-container.is-empty {
  right: -20%;
}

.title-selected {
  color: blue;
}
.title-hidden {
  color: red;
}
</style>
