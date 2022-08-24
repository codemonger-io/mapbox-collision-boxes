English / [日本語](./README_ja.md)

# Mapbox Collision Boxes

A utility library for [Mapbox GL JS (`mapbox-gl`)](https://docs.mapbox.com/mapbox-gl-js/guides/), that calculates collision boxes of symbols on a Mapbox map in the screen coordinate.

## Getting started

### Prerequisites

This library is supposed to work with `mapbox-gl` version 2 or higher.

### How to install

Please add this repository to your dependencies.

```sh
npm install https://github.com/codemonger-io/mapbox-collision-boxes#v0.1.0
```

### Usage

The following snippet is an example to collect features hidden by a clicked symbol on the screen.

```ts
import mapboxgl from 'mapbox-gl';
import { boxesIntersect, collectCollisionBoxesAndFeatures } from 'mapbox-collision-boxes';

const map = new mapboxgl.Map(
    // ... initialize map
);
// ... other configurations
const layerId = 'cats-and-dogs'; // suppose you have a custom layer
const map.on('click', layerId, async event => {
    const clickedFeatureId = event.features[0].id;
    const collisionBoxes = await collectCollisionBoxesAndFeatures(map, layerId);
    const clickedBox = collisionBoxes.find(box => box.feature.id === clickedFeatureId);
    const hiddenBoxes = collisionBoxes.filter(box => box !== clickedBox && boxesIntersect(box.box, clickedBox.box));
    const hiddenFeatures = hiddenBoxes.map(box => box.feature);
    // ... process features
});
```

You can find a complete project in the [`example`](./example) folder.

## Motivation

I have been developing an app that shows custom symbols on a map using [symbol layers](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#symbol) of `mapbox-gl`.
When symbols overlap on the screen, `mapbox-gl` shows only the first one and hides other overlapping ones.
As far as I know, there is no `mapbox-gl` API to get symbols hidden by a specific symbol on the screen.
This is not convenient for my app because it wants to list all the symbols including hidden ones at a clicked point.
Although there is an [option](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#layout-symbol-icon-allow-overlap) that makes `mapbox-gl` skip collision detection and show every single symbol on the screen, this will make the map too busy if there are many overlapping symbols.

So I decided to **develop a library that can aggregate symbols overlapping with a specific symbol on a Mapbox map**.

Please refer to [my blog post](https://codemonger.io/blog/0009-mapbox-collision-boxes/) for more details.

## API Documentation

Please refer to [`api-docs/markdown/index.md`](./api-docs/markdown/index.md).

## Tips

### Viewport padding

Collision boxes collected by [`collectCollisionBoxesAndFeatures`](./api-docs/markdown/mapbox-collision-boxes.collectcollisionboxesandfeatures.md) include constant offsets.
They have the actual screen position + `100`\* along both the x- and y-axes.
Since the offsets do not matter to hit tests among collision boxes, this library leaves them to avoid unnecessary calculation.
If you want to project collision boxes to the actuall screen, you have to subtract `100` from their x- and y-axis values.

\* This constant is defined as `viewportPadding` at https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/collision_index.js#L50 which is not exported from `mapbox-gl`.