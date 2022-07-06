const magnifiers = [
    // None
    {
        name: 'mag_standard',
        display: 'Standard',
        settings: {
            active: 1,
            default: 1,
            max: 10,
            min: 1,
            step: 0.5,
            vf: false
        },
        update: (i, index, lensing, lenses) => {
        },
        fill: 'rgba(255, 255, 255, 0)',
        stroke: 'rgba(0, 0, 0, 1)'
    },
    // Fisheye - from jOloga
    {
        name: 'mag_fisheye',
        display: 'Fisheye',
        settings: {
            active: 1,
            default: 1,
            max: 2,
            min: 1,
            step: 0.5,
            vf: false
        },
        update: (i, index, lensing, lenses) => {
            // Add to copy index
            lenses.imgData.copyIndexed.push([
                lenses.imgData.copy.data[i],
                lenses.imgData.copy.data[i + 1],
                lenses.imgData.copy.data[i + 2],
                lenses.imgData.copy.data[i + 3]
            ]);

            // Check if at end
            if (i + 4 === lenses.imgData.orig.data.length) {
                // Get fisheye result
                const wh = lensing.configs.rad * 2 * lensing.configs.mag;
                const result = fisheye(lenses.imgData.copyIndexed, wh, wh);
                // Update copy
                for (let j = 0; j < result.length; j++) {
                    const reIndex = 4 * j;
                    if (result[j]) {
                        lenses.imgData.copy.data[reIndex] = result[j][0];
                        lenses.imgData.copy.data[reIndex + 1] = result[j][1];
                        lenses.imgData.copy.data[reIndex + 2] = result[j][2];
                        lenses.imgData.copy.data[reIndex + 3] = result[j][3];
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
    {
        name: 'mag_plateau',
        display: 'Plateau',
        settings: {
            active: 1.5,
            default: 1.5,
            max: 5,
            min: 1,
            step: 0.5,
            vf: false
        },
        update: (i, index, lensing, lenses) => {

            // Define lenses
            const vis = lenses;

            // Config
            const w = lenses.imgData.orig.width;
            const preserve = 0.67;

            // Get x, y, and r
            const x = index % w - (w / 2);
            const y = Math.floor(index / w) - (w / 2);
            const r = Math.sqrt(x ** 2 + y ** 2);

            // Get pixels
            if (r < lensing.configs.rad * preserve) {
                lenses.imgData.copyIndexed.push(
                    lenses.imgData.copy.data[i],
                    lenses.imgData.copy.data[i + 1],
                    lenses.imgData.copy.data[i + 2],
                    lenses.imgData.copy.data[i + 3]
                );
            } else if (r <= lensing.configs.rad) {
                // Discover pos of extended radius
                const rad = Math.atan2(x, y);
                // Calc new pos
                vis.tools.plateauScale
                    .domain([vis.lensing.configs.rad * preserve, vis.lensing.configs.rad])
                    .range([vis.lensing.configs.rad * preserve, w / 2]);
                const add = vis.tools.plateauScale(r);
                const newX = Math.round(add * Math.sin(rad));
                const newY = Math.round(add * Math.cos(rad));
                const col = (newX + w / 2) * 4;
                const row = (newY + w / 2) * w * 4;
                const pos = col + row;

                // Redefine
                lenses.imgData.copyIndexed.push(
                    lenses.imgData.copy.data[pos],
                    lenses.imgData.copy.data[pos + 1],
                    lenses.imgData.copy.data[pos + 2],
                    lenses.imgData.copy.data[pos + 3]
                );
            } else {
                lenses.imgData.copyIndexed.push(
                    0,
                    0,
                    0,
                    255
                );
            }

            // If last one
            if (i >= w * w * 4 - 4) {
                lenses.imgData.copy.data = lenses.imgData.copyIndexed;
            }

            /*
            function scale(input) {
                const d = [vis.lensing.configs.rad * preserve, vis.lensing.configs.rad];
                const r = [vis.lensing.configs.rad * preserve, w / 2];
                return -((d[1] - input) * (r[1] - r[0]) / (d[1] - d[0]) - r[1]);
            }
            */
        },
    },
];

export default magnifiers;