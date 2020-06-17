'use strict';

// Image
const target = 'viewer'
const image = 'PIA23533_index32.dzi'

// Config
const viewer_config = {
    id: target,
    prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
    tileSources: `./static/assets/${image}`,
    homeFillsViewer: true,
    visibilityRatio: 1.0
}

// Instantiate viewer
const viewer = OpenSeadragon(viewer_config);

// Instantiate Lensing
viewer.lensing = new Lensing(viewer, viewer_config);