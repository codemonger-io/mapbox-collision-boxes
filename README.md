English / [日本語](./README_ja.md)

# Mapbox Collision Boxes

A utility library for [Mapbox GL JS (`mapbox-gl`)](https://docs.mapbox.com/mapbox-gl-js/guides/), that calculates collision boxes of symbols on a Mapbox map in the screen coordinate.

## Getting started

### Prerequisites

This library is intended to work with `mapbox-gl` version 2.x and 3.x.
(I have not tested it with version newer than 3.13.0.)

### How to install

Please add this repository to your dependencies.

```sh
npm install https://github.com/codemonger-io/mapbox-collision-boxes#v0.3.0
```

### Usage

The following snippet is an example to collect features hidden by a clicked symbol on the screen.

```ts
import mapboxgl from 'mapbox-gl';
import { boxesIntersect, collectCollisionBoxesAndFeatures } from '@codemonger-io/mapbox-collision-boxes';

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

### Remarks on type compatibility

While this library supports both `mapbox-gl` version 2.x and 3.x, you may face a type error at the call of the `collectCollisionBoxesAndFeatures` function if your `mapbox-gl` version is different from the one (3.13.0) for which this library is built.
Please ignore or suppress the type error in case you see it.

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
They have the actual screen position + `100`[^1] along both the x- and y-axes.
Since the offsets do not matter to hit tests among collision boxes, this library leaves them to avoid unnecessary calculation.
If you want to project collision boxes to the actual screen, you have to subtract `100` from their x- and y-axis values.

[^1]: This constant is defined as `viewportPadding` at https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/collision_index.js#L50 which is not exported from `mapbox-gl`.

## License

Since this library borrows the code from `mapbox-gl`, the [Mapbox Web SDK license](https://github.com/mapbox/mapbox-gl-js?tab=readme-ov-file#license) should be applied.
In a nutshell, you can use this library as long as you use it with the relevant Mapbox product(s) and comply with the Mapbox TOS.
Anyway, I am not a lawyer, please use and modify this library **AT YOUR OWN RISK**.

## Development

### Resoving dependencies

```sh
pnpm install --frozen-lockfile
```

### Type-checking

```sh
pnpm type-check
```

### Building the library

```sh
pnpm build
```