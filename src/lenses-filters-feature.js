const filters = [
    {
        data: [], name: 'fil_data_rgb', display: 'Data RGB', settings: {
            active: 1,
            async: false,
            default: 1,
            loading: false,
            max: 1,
            min: 0,
            step: 1,
            vf: true,
            vf_setup: 'vis_data_rgb',
            iter: 'px'
        }, setPixel: function (px, lensing, lenses) {

            // This filter
            const filter = this;

            if (filter.data.length > 0) {

                // Get pixel data for vis
                let sel = null;
                let diff = 255 * 3;
                let range = 0;
                lenses.selections.filter.data.forEach(d => {
                    // Measure difference
                    const r_mean = (px.data[0] + +d.r) / 2;
                    const r_diff = px.data[0] - +d.r;
                    const g_diff = px.data[1] - +d.g;
                    const b_diff = px.data[2] - +d.b;
                    const cDiff = Math.sqrt((2 + r_mean / 256) * r_diff ** 2 + 4 * g_diff ** 2 + (2 + (255 - r_mean) / 256) * b_diff ** 2);
                    // If smaller difference - TODO: linked to filter lens 'dataRgb' optimization
                    if (cDiff <= diff) {
                        range = diff;
                        diff = cDiff;
                        sel = d;
                    }
                });
                lensing.configs.pxData = {
                    sel: sel, sel_range: diff, range: []
                };

            }
        }, update: function (i, index, lensing, lenses) {

            // This filter
            const filter = this;

            if (filter.data.length > 0) {

                // See if matches selected
                let selected = null;
                let diff = 255 * 3;
                // Iterate
                lenses.selections.filter.data.forEach((d, j) => {
                    const r_mean = (lenses.imgData.copy.data[i] + +d.r) / 2;
                    const r_diff = lenses.imgData.copy.data[i] - +d.r;
                    const g_diff = lenses.imgData.copy.data[i + 1] - +d.g;
                    const b_diff = lenses.imgData.copy.data[i + 2] - +d.b;
                    const cDiff = Math.sqrt((2 + r_mean / 256) * r_diff ** 2 + 4 * g_diff ** 2 + (2 + (255 - r_mean) / 256) * b_diff ** 2);
                    // If smaller difference
                    if (cDiff < diff) {
                        diff = cDiff;
                        selected = d;
                    }
                });
                if (selected.name === lensing.configs.pxData.sel.name) {
                    // Push to range
                    lensing.configs.pxData.range.push(Math.round(diff));
                    // Update pixel data
                    lenses.imgData.copy.data[i] = lensing.configs.pxData.sel.r;
                    lenses.imgData.copy.data[i + 1] = lensing.configs.pxData.sel.g;
                    lenses.imgData.copy.data[i + 2] = lensing.configs.pxData.sel.b;
                } else {
                    // Update pixel data
                    lenses.imgData.copy.data[i] = (lenses.imgData.copy.data[i] + 255) / 2;
                    lenses.imgData.copy.data[i + 1] = (lenses.imgData.copy.data[i + 1] + 255) / 2;
                    lenses.imgData.copy.data[i + 2] = (lenses.imgData.copy.data[i + 2] + 255) / 2;
                }
            }

            // Magnify
            lenses.selections.magnifier.update(i, index, lensing, lenses);

        }, fill: 'rgba(255, 255, 255, 0)', stroke: 'rgba(0, 0, 0, 1)'
    },
];

export default filters;