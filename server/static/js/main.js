'use strict';

// Image
const target = 'viewer'
const image = 'PIA23533_index32.dzi'

// Instantiate viewer
const viewer = OpenSeadragon({
    id: target,
    prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
    tileSources: `./static/assets/${image}`,
    homeFillsViewer: true,
    visibilityRatio: 1.0,
});

// Instantiate Lensing
const lensing = new Lensing(viewer);
