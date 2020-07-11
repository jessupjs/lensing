import * as d3 from 'd3';

/**
 * @class Viewfinder
 */
export default class Viewfinder {

    // Class refs
    lensing = null;

    // Data
    data = null;
    annos = true;

    // Elements
    els = {
        dataPointG: null,
        g: null,
        radialG: null,
        svg: null,
    };

    // Configs
    configs = {
        deg: 0,
        extend: 50,
        gMargin: {top: 0, left: 0, right: 0, bottom: 0},
        gH: 0,
        h: 0,
        r: 0,
        rPointer: 0,
        rPointerExt: 10,
        w: 0,
        gW: 0
    };

    // Tools
    tools = {
        coordScale: d3.scaleLinear()
            .domain([0, 360])
            .range([Math.PI, -Math.PI]),
        lineMaker: d3.line()
    }

    /*
    Constructor
     */
    constructor(_lensing) {
        // Fields
        this.lensing = _lensing;

        // Init
        this.init();
    }

    /**
     * 1.
     * @function init
     *
     */
    init() {
        // Define this
        const vis = this;

        // Build svg, g
        vis.els.svg = d3.select(vis.lensing.overlay.container)
            .append('svg');
        vis.els.g = vis.els.svg.append('g')
            .attr('class', 'viewfinder_g')
            .style('transform', `translate(${vis.configs.gMargin.top}px, ${vis.configs.gMargin.left}px)`);

        // Attach component g's
        vis.els.radialG = vis.els.g.append('g')
            .attr('class', 'viewfinder_radial_g');
        vis.els.dataPointG = vis.els.radialG.append('g')
            .attr('class', 'viewfinder_data_point_g');
        vis.els.dataPointG.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 1)')
            .style('transform', 'translate3d(0, 0, 0)');

    }

    /**
     * @function wrangle
     *
     */
    wrangle() {
        // Define this
        const vis = this;

        // Update data
        vis.data = this.lensing.configs.pxData;

        // Update configs
        vis.configs.r = vis.lensing.configs.rad / vis.lensing.configs.pxRatio;
        vis.configs.rPointer = vis.configs.r + vis.configs.rPointerExt;
        vis.configs.w = vis.configs.h = (vis.configs.r + vis.configs.extend) * 2;
        vis.configs.gW = vis.configs.w - (vis.configs.gMargin.right + vis.configs.gMargin.left);
        vis.configs.gH = vis.configs.h - (vis.configs.gMargin.top + vis.configs.gMargin.bottom);

        // Check coordinate position
        if (vis.annos) {
            const x = this.lensing.configs.pos[0] / vis.lensing.configs.pxRatio - this.lensing.viewer.canvas.clientWidth / 2;
            const y = this.lensing.configs.pos[1] / vis.lensing.configs.pxRatio - this.lensing.viewer.canvas.clientHeight / 2;
            vis.deg = Math.atan2(y, x) * (180 / Math.PI);
        }

        // Render
        vis.render()
    }

    /**
     * @function render
     *
     */
    render() {
        // Define this
        const vis = this;

        // Update svg, g
        vis.els.svg.attr('width', vis.configs.w)
            .attr('height', vis.configs.h)
            .attr('style', `position: absolute; left: ${-vis.configs.extend}px; top: ${-vis.configs.extend}px;`)

        // Update radialG
        vis.els.radialG.style('transform', `translate(${vis.configs.gW / 2}px, ${vis.configs.gH / 2}px)`)

        // Update dataPointG
        if (vis.annos) {
            vis.els.dataPointG
                .datum(vis.data)
                .each(function (d) {
                    const g = d3.select(this);

                    // Pointer coords
                    const pCoords = getCoords(vis.configs.rPointer, vis.deg - 90);

                    // Update path
                    g.select('path')
                        .attr('d', vis.tools.lineMaker([[0, 0], pCoords]));
                });
        }

        /* getCoords */
        function getCoords(r, i) {
            const x = Math.round(r * Math.sin(vis.tools.coordScale(i)));
            const y = Math.round(r * Math.cos(vis.tools.coordScale(i)));
            return [x, y];
        }

    }


}