
const filters = [
    // Natural
    {
        name: 'fil_none',
        display: 'No Filter',
        settings: {
            active: 1,
            async: false,
            default: 1,
            loading: false,
            max: 1,
            min: 0,
            step: 1,
            vf: false,
            iter: 'px'
        },
        update: (i, index, lensing, lenses) => {
            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Sobel Edge
    {
        name: 'fil_sobeledge',
        display: 'Sobel Edge',
        settings: {
            active: 127,
            async: false,
            default: 127,
            loading: false,
            max: 255,
            min: 0,
            step: 1,
            vf: false,
            iter: 'wh'
        },
        update: function(x, y, lensing, lenses) {

            // TODO - need to optimize - slow performance

            // Define this
            const filter = this;

            // Kernals
            const sobel_x = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
            const sobel_y = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];

            // Px location
            function getPxLoc(xx, yy) {
                return ((yy * lenses.imgData.orig.width) + xx) * 4;
            }

            // To grayscale
            function toGrayscale(i) {
                return Math.round(
                    lenses.imgData.orig.data[i] * 0.2126
                    + lenses.imgData.orig.data[i + 1] * 0.7152
                    + lenses.imgData.orig.data[i + 2] * 0.0722
                );
            }

            // To Pixel vals
            function returnPixel(arr) {
                if (x >= 0 && x < lenses.imgData.orig.width - 1 && y >= 0 && y < lenses.imgData.orig.height - 1) {
                    return (arr[0][0] * toGrayscale(getPxLoc(x - 1, y - 1)))
                        + (arr[0][1] * toGrayscale(getPxLoc(x, y - 1)))
                        + (arr[0][2] * toGrayscale(getPxLoc(x + 1, y - 1)))
                        + (arr[1][0] * toGrayscale(getPxLoc(x - 1, y)))
                        + (arr[1][1] * toGrayscale(getPxLoc(x, y)))
                        + (arr[1][2] * toGrayscale(getPxLoc(x + 1, y)))
                        + (arr[2][0] * toGrayscale(getPxLoc(x - 1, y + 1)))
                        + (arr[2][1] * toGrayscale(getPxLoc(x, y + 1)))
                        + (arr[2][2] * toGrayscale(getPxLoc(x + 1, y + 1)));
                }
                return 0;
            }

            const pixel_x = returnPixel(sobel_x);
            const pixel_y = returnPixel(sobel_y);
            let val = Math.round(Math.sqrt(pixel_x * pixel_x + pixel_y * pixel_y));
            const px_loc = getPxLoc(x, y);
            lenses.imgData.copy.data.push(lenses.imgData.orig.data[px_loc], lenses.imgData.orig.data[px_loc + 1],
                lenses.imgData.orig.data[px_loc + 2], lenses.imgData.orig.data[px_loc + 3])
            lenses.imgData.copy.data[px_loc] = lenses.imgData.copy.data[px_loc + 1] = lenses.imgData.copy.data[px_loc + 2] = val;

            // Magnify
            lenses.selections.magnifier.update(px_loc, px_loc / 4, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Grayscale (from some source TODO - check 'rangi' work)
    {
        name: 'fil_grayscale',
        display: 'Grayscale',
        settings: {
            active: 127,
            async: false,
            default: 127,
            loading: false,
            max: 255,
            min: 0,
            step: 1,
            vf: false,
            iter: 'px'
        },
        update: (i, index, lensing, lenses) => {
            // Perform pixel modification
            const set = lenses.selections.filter.settings.active;
            const gray = Math.round(
                lenses.imgData.copy.data[i] * 0.2126
                + lenses.imgData.copy.data[i + 1] * 0.7152
                + lenses.imgData.copy.data[i + 2] * 0.0722
            );
            lenses.imgData.copy.data[i] = lenses.imgData.copy.data[i + 1] = lenses.imgData.copy.data[i + 2] = gray;
            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Invert
    {
        name: 'fil_invert',
        display: 'Invert',
        settings: {
            active: 255,
            async: false,
            default: 255,
            loading: false,
            max: 255,
            min: 0,
            step: 1,
            vf: false,
            iter: 'px'
        },
        update: (i, index, lensing, lenses) => {
            // Perform pixel modification
            const set = lenses.selections.filter.settings.active;

            function invert(v) {
                return Math.abs(set - v);
            }

            lenses.imgData.copy.data[i] = invert(lenses.imgData.copy.data[i]);
            lenses.imgData.copy.data[i + 1] = invert(lenses.imgData.copy.data[i + 1]);
            lenses.imgData.copy.data[i + 2] = invert(lenses.imgData.copy.data[i + 2]);
            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Threshold (from NIST)
    {
        name: 'fil_threshold',
        display: 'Threshold',
        settings: {
            active: 127,
            async: false,
            default: 127,
            loading: false,
            max: 255,
            min: 0,
            step: 1,
            vf: false,
            iter: 'px'
        },
        update: (i, index, lensing, lenses) => {
            // Perform pixel modification
            const set = lenses.selections.filter.settings.active;
            const sum = (lenses.imgData.copy.data[i] + lenses.imgData.copy.data[i + 1]
                + lenses.imgData.copy.data[i + 2]) / 3;
            lenses.imgData.copy.data[i] = lenses.imgData.copy.data[i + 1] = lenses.imgData.copy.data[i + 2]
                = sum < set ? 0 : 255;
            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Gamma (from SO - Deepu and Guffa)
    {
        name: 'fil_gamma',
        display: 'Gamma',
        settings: {
            active: 0.5,
            async: false,
            default: 0.5,
            loading: false,
            max: 5.5,
            min: 0,
            step: 0.1,
            vf: false,
            iter: 'px'
        },
        update: (i, index, lensing, lenses) => {
            // Perform pixel modification
            const set = lenses.selections.filter.settings.active;

            function gamma(v) {
                return 255 * (v / 255) ** (1 / set);
                // return Math.pow(v / 255, set) * 255;
            }

            lenses.imgData.copy.data[i] = gamma(lenses.imgData.copy.data[i]);
            lenses.imgData.copy.data[i + 1] = gamma(lenses.imgData.copy.data[i + 1]);
            lenses.imgData.copy.data[i + 2] = gamma(lenses.imgData.copy.data[i + 2]);

            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },

];

export default filters;