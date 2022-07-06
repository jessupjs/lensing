import * as d3 from 'd3';
import BoxFiltersImage from './lenses-filters-image';
import BoxFiltersFeature from './lenses-filters-feature';
import BoxMagnifiers from './lenses-magnifiers';

/*
LFilters
 + Some filters from National Institute of Standards and Technology (indicated below)
   - https://github.com/usnistgov/OpenSeadragonFiltering/blob/master/openseadragon-filtering.js
 + Fisheye magnification demo from jOloga
   - https://codepen.io/jOlga/pen/KyQMQW?editors=0010
 + Color differences
   - https://www.compuphase.com/cmetric.htm
 + Gamma
   - https://stackoverflow.com/questions/16521003/gamma-correction-formula-gamma-or-1-gamma
 + Sobel edge
   - https://stackoverflow.com/questions/17815687/image-processing-implementing-sobel-filter
   - https://github.com/miguelmota/sobel
 */

/* TODO
    - need to optimize for any image greater than the lens dims
 */

export default class Lenses {

    // Class refs
    lensing = null;
    filters = [];
    magnifiers = [];

    // Configs
    config = {
        preserve: 0.75,
        scale: 1
    };

    // Defaults
    defaults = {
        filterRefs: [
            'fil_none',
        ],
        magnifierRefs: [
            'mag_standard',
        ],
    }

    // Selections
    selections = {
        filter: null,
        magnifier: null
    };

    // Data
    imgData = {
        orig: null,
        copy: null,
        copyIndexed: []
    };

    // Tools
    tools = {
        plateauScale: d3.scaleSqrt()
    }

    /**
     * @constructor
     *
     * @param {any} _lensing
     */
    constructor(_lensing) {

        // Fields
        this.lensing = _lensing;

        // Get any added defaults from configs
        this.defaults.filterRefs =
            Array.from(new Set(this.defaults.filterRefs.concat(this.lensing.configs.addOnBoxFilters)));
        this.defaults.magnifierRefs =
            Array.from(new Set(this.defaults.magnifierRefs.concat(this.lensing.configs.addOnBoxMagnifiers)));

        //
        this.filters = this.loadDefaultFilters();
        this.magnifiers = this.loadDefaultMagnifiers();

        // Defaults
        this.selections.filter = this.filters[0];
        this.selections.magnifier = this.magnifiers[0];
    }

    /** - TODO :: ckpt. 20220706
     * @function modify
     *
     * @param {ImageData} imgD
     *
     * @returns ImageData
     */
    modify(imgD) {

        // Do not need deep copy atm
        this.imgData.orig = imgD;
        this.imgData.copy = {
            data: []
        };
        this.imgData.copyIndexed = [];

        // Iterate and update
        if (this.selections.filter.settings.iter === 'px') {
            let index = 0;
            this.imgData.copy.data = this.imgData.orig.data;
            for (let i = 0; i < this.imgData.orig.data.length; i += 4) {
                // Update filter
                this.selections.filter.update(i, index, this.lensing, this);
                // Increment index
                index++;
            }
        } else if (this.selections.filter.settings.iter === 'wh') {
            // Copy
            for (let y = 0; y < this.imgData.orig.height; y++) {
                for (let x = 0; x < this.imgData.orig.width; x++) {
                    // Update filter
                    this.selections.filter.update(x, y, this.lensing, this);
                }
            }
        }

        // Update viewfinder
        this.lensing.viewfinder.wrangle();

        // Return modified image data
        const copyData = new Uint8ClampedArray(this.imgData.copy.data);
        // KEEP4REF // console.log(copyImageData, Math.sqrt(copyImageData.data.length / 4));
        return new ImageData(copyData, this.imgData.orig.width, this.imgData.orig.height);
    }

    /** - TODO :: ckpt. 20220706
     * @function changeLens
     *
     * @param {string} direction
     * @param {string} lensType
     *
     * @returns void
     */
    changeLens(direction, lensType) {
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

    /** - FIXME :: revisit post-"bare bones"
     * @function check_for_data_filter
     *
     * @param {Object} ref
     *
     * @returns void
     */
    checkForDataFilter(ref) {

        // Define this
        const vis = this;

        // Filter
        const dataFilter = this.filters.find(d => d.name === ref.config.filter);
        if (dataFilter) {
            installFilter(dataFilter)
        } else if (ref.config.filter === 'fil_data_custom') {
            installFilter(ref.config.filterCode);
        }

        // Abstract installation
        function installFilter(fil) {
            // Add to filters
            const first = vis.filters.shift();
            vis.filters.unshift(fil);
            vis.filters.unshift(first);
            // Update w data
            fil.data = ref.data;
        }
    }

    /** - TODO :: ckpt. 20220706
     * @function updateFilter
     *
     * @param {number} val
     *
     * @returns void
     */
    updateFilter(val) {

        // Update filter
        this.selections.filter.settings.active = val;
    }

    /** - TODO :: ckpt. 20220706
     * loadDefaultFilters
     */
    loadDefaultFilters() {
        return (BoxFiltersImage.concat(BoxFiltersFeature)).filter(f => this.defaults.filterRefs.includes(f.name))
    }

    /** - TODO :: ckpt. 20220706
     * loadDefaultMagnifiers
     */
    loadDefaultMagnifiers() {
        return BoxMagnifiers.filter(f => this.defaults.magnifierRefs.includes(f.name));
    }

}

/*
 ref.
    + https://stackoverflow.com/questions/17615963/standard-rgb-to-grayscale-conversion
    + https://stackoverflow.com/questions/16521003/gamma-correction-formula-gamma-or-1-gamma
 */