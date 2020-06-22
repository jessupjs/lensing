/*
LFilters
 + Some filters from National Institute of Standards and Technology (indicated below)
   - https://github.com/usnistgov/OpenSeadragonFiltering/blob/master/openseadragon-filtering.js
 + Fisheye magnification demo from jOloga
   - https://codepen.io/jOlga/pen/KyQMQW?editors=0010
 */

export default class Lenses {

    // Class refs
    lensing = null;

    // Configs
    config = {
        preserve: 0.75,
        scale: 1
    };

    // Selections
    selections = {
        filter: null,
        magnifier: null
    };

    // Data
    img_data = {
        orig: null,
        copy: null,
        copy_indexed: []
    };

    /*
    CONSTRUCTOR
     */
    constructor(_lensing) {
        // Fields
        this.lensing = _lensing;
        // Defaults
        this.selections.filter = this.filters[0];
        this.selections.magnifier = this.magnifiers[0];
    }

    /*
    modify
     */
    modify(imgD) {

        // Do not need deep copy atm
        this.img_data.orig = imgD;
        this.img_data.copy = {
            data: []
        };
        this.img_data.copy_indexed = [];

        // Iterate and update
        let index = 0;
        for (let i = 0; i < this.img_data.orig.data.length; i += 4) {
            // Copy
            this.img_data.copy.data.push(
                this.img_data.orig.data[i],
                this.img_data.orig.data[i + 1],
                this.img_data.orig.data[i + 2],
                this.img_data.orig.data[i + 3]
            );
            // Update filter
            this.selections.filter.update(i, index);
            // Increment index
            index++;
        }

        // Return modified image data
        const copyData = new Uint8ClampedArray(this.img_data.copy.data);
        const copyImageData = new ImageData(copyData, this.img_data.orig.width, this.img_data.orig.height);
        return copyImageData;
    }

    /*
    change_lens
     */
    change_lens(direction, lensType) {
        let lensSet = [];
        if (lensType === 'filter') {
            lensSet = this.filters;
        } else if (lensType === 'magnifier') {
            lensSet = this.magnifiers;
        }
        let index = 0;
        if (direction === 'none') {
            this.selections[lensType] = lensSet[index];
        } else {
            lensSet.forEach((f, i) => {
                if (f.name === this.selections[lensType].name) {
                    index = i;
                }
            });
            if (direction === 'next') {
                if (index + 1 === lensSet.length) {
                    this.selections[lensType] = lensSet[0];
                } else {
                    this.selections[lensType] = lensSet[index + 1];
                }
            } else if (direction === 'prev') {
                if (index - 1 < 0) {
                    this.selections[lensType] = lensSet[this.filters.length - 1];
                } else {
                    this.selections[lensType] = this.filters[index - 1];
                }
            }
        }
    }

    /*
    update_filter
     */
    update_filter(val) {

        // Update filter
        this.selections.filter.settings.active = val;
    }

    /*
    filters
     */
    filters = [
        // Natural
        {
            name: 'fil_none',
            vis_name: 'None',
            settings: {
                active: 1,
                default: 1,
                max: 1,
                min: 0,
                step: 1
            },
            update: (i, index) => {
                // Magnify
                this.selections.magnifier.update(i, index);
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Grayscale
        {
            name: 'fil_grayscale',
            vis_name: 'Grayscale',
            settings: {
                active: 127,
                default: 127,
                max: 255,
                min: 0,
                step: 1
            },
            update: (i, index) => {
                // Perform pixel modification
                const set = this.selections.filter.settings.active;
                const gray = Math.round(
                    this.img_data.copy.data[i] * 0.2126
                    + this.img_data.copy.data[i + 1] * 0.7152
                    + this.img_data.copy.data[i + 2] * 0.0722
                );
                this.img_data.copy.data[i] = this.img_data.copy.data[i + 1] = this.img_data.copy.data[i + 2] = gray;
                // Magnify
                this.selections.magnifier.update(i, index);
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Invert
        {
            name: 'fil_invert',
            vis_name: 'Invert',
            settings: {
                active: 255,
                default: 255,
                max: 255,
                min: 0,
                step: 1
            },
            update: (i, index) => {
                // Perform pixel modification
                const set = this.selections.filter.settings.active;

                function invert(v) {
                    return Math.abs(set - v);
                }

                this.img_data.copy.data[i] = invert(this.img_data.copy.data[i]);
                this.img_data.copy.data[i + 1] = invert(this.img_data.copy.data[i + 1]);
                this.img_data.copy.data[i + 2] = invert(this.img_data.copy.data[i + 2]);
                // Magnify
                this.selections.magnifier.update(i, index);
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Threshold (from NIST)
        {
            name: 'fil_threshold',
            vis_name: 'Threshold',
            settings: {
                active: 127,
                default: 127,
                max: 255,
                min: 0,
                step: 1
            },
            update: (i, index) => {
                // Perform pixel modification
                const set = this.selections.filter.settings.active;
                const sum = (this.img_data.copy.data[i] + this.img_data.copy.data[i + 1]
                    + this.img_data.copy.data[i + 2]) / 3;
                this.img_data.copy.data[i] = this.img_data.copy.data[i + 1] = this.img_data.copy.data[i + 2]
                    = sum < set ? 0 : 255;
                // Magnify
                this.selections.magnifier.update(i, index);
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Gamma - TODO ... eval
        {
            name: 'fil_gamma',
            vis_name: 'Gamma',
            settings: {
                active: 1,
                default: 3,
                max: 4,
                min: 1,
                step: 0.1
            },
            update: (i, index) => {
                // Perform pixel modification
                const set = this.selections.filter.settings.active;

                function gamma(v) {
                    return Math.round(((v / 255) ** (1 / set)) * 255);
                }

                this.img_data.copy.data[i] = gamma(this.img_data.copy.data[i]);
                this.img_data.copy.data[i + 1] = gamma(this.img_data.copy.data[i + 1]);
                this.img_data.copy.data[i + 2] = gamma(this.img_data.copy.data[i + 2]);
                // Magnify
                this.selections.magnifier.update(i, index);
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },

    ];

    /*
    magnifiers
     */
    magnifiers = [
        // None
        {
            name: 'mag_standard',
            vis_name: 'Standard',
            settings: {
                active: 1,
                default: 1,
                max: 10,
                min: 1,
                step: 0.5
            },
            update: (i, index) => {
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Fisheye - from jOloga
        {
            name: 'mag_fisheye',
            vis_name: 'Fisheye',
            settings: {
                active: 1,
                default: 1,
                max: 2,
                min: 1,
                step: 0.25},
            update: (i, index) => {
                // Add to copy index
                this.img_data.copy_indexed.push([
                    this.img_data.copy.data[i],
                    this.img_data.copy.data[i + 1],
                    this.img_data.copy.data[i + 2],
                    this.img_data.copy.data[i + 3]
                ]);

                // Check if at end
                if (i + 4 === this.img_data.orig.data.length) {
                    // Get fisheye result
                    const wh = this.lensing.configs.rad * 2 * this.lensing.configs.mag;
                    const result = fisheye(this.img_data.copy_indexed, wh, wh);
                    // Update copy
                    for (let j = 0; j < result.length; j++) {
                        const reIndex = 4 * j;
                        if (result[j]) {
                            this.img_data.copy.data[reIndex + 0] = result[j][0];
                            this.img_data.copy.data[reIndex + 1] = result[j][1];
                            this.img_data.copy.data[reIndex + 2] = result[j][2];
                            this.img_data.copy.data[reIndex + 3] = result[j][3];
                        }
                    }

                }

                // fisheye()
                function fisheye(srcpixels, w, h) {

                    const dstpixels = srcpixels.slice();

                    for (let y = 0; y < h; y++) {
                        const ny = ((2 * y) / h) - 1;
                        const ny2 = ny * ny;

                        for (let x = 0; x < w; x++) {
                            const nx = ((2 * x) / w) - 1;
                            const nx2 = nx * nx;
                            const r = Math.sqrt(nx2 + ny2);

                            if (0.0 <= r && r <= 1.0) {
                                let nr = Math.sqrt(1.0 - r * r);
                                nr = (r + (1.0 - nr)) / 2.0;

                                if (nr <= 1.0) {
                                    const theta = Math.atan2(ny, nx);
                                    const nxn = nr * Math.cos(theta);
                                    const nyn = nr * Math.sin(theta);
                                    const x2 = Math.round(((nxn + 1) * w) / 2);
                                    const y2 = Math.round(((nyn + 1) * h) / 2);
                                    const srcpos = y2 * w + x2;
                                    if (srcpos >= 0 && srcpos < w * h) {
                                        dstpixels[y * w + x] = srcpixels[srcpos];
                                    }
                                }
                            }
                        }
                    }
                    return dstpixels;
                }
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Plateau
        /*{
            name: 'mag_plateau',
            vis_name: 'Plateau',
            settings: {},
            update: (i, index) => {

                // Get x, y, and r
                let x = index % this.d.width;
                if (x < this.wh) {
                    x += -this.d.width / 2;
                } else {
                    x += -this.d.width / 2 + 1;
                }
                let y = Math.floor(index / this.d.width);
                if (y < this.wh) {
                    y += -this.d.height / 2;
                } else {
                    y += -this.d.height / 2 + 1;
                }
                const r = Math.sqrt(x ** 2 + y ** 2);

                // Get pixels
                const threshold = this.d.width * this.scale * 0.5;
                if (x <= threshold && x >= -threshold &&
                    y <= threshold && y >= -threshold) {
                    if (r <= this.wh * 0.5 * this.preserve) {
                        this.img_data.copy.push(this.d.data[i], this.d.data[i + 1], this.d.data[i + 2], this.d.data[i + 3]);
                    } else {
                        this.img_data.copy.push(0, 0, 0, 255);
                    }

                }
            },
        },*/
    ];

}

/*
 ref.
    + https://stackoverflow.com/questions/17615963/standard-rgb-to-grayscale-conversion
    + https://stackoverflow.com/questions/16521003/gamma-correction-formula-gamma-or-1-gamma
 */