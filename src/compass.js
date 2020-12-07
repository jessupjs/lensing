import * as d3 from 'd3';

/**
 * @class Compass
 */
export default class Compass {

    // Class vars
    on = false;
    operational = false;

    configs = {
        degFactor: 0,
        dimsConv: [],
        dimsDigi: [],
        dimsPhys: [],
        h: 0,
        offset: 10,
        labelPadding: 35,
        padding: 40,
        r: 0,
        tickCount: 5,
        tickSize: 5,
        unitConv: null,
        unitPhysX: '',
        unitPhysY: '',
        w: 0,
    }

    // Elements
    els = {
        axesG: null,
        axisX: null,
        axisY: null,
        offsetG: null,
        g: null,
        labelG: null,
        labelText: null,
        svg: null,
    };

    // Tools
    tools = {
        // axisX: d3.axisTop(),
        // axisY: d3.axisLeft(),
        scUnits: d3.scaleLinear(),
        scDims: d3.scaleLinear()
    };

    /*
    CONSTRUCTOR
     */
    constructor(_lensing) {
        // Fields
        this.lensing = _lensing;
        // Init
        this.init();
    }

    /** 1.
     * @function init
     *
     * @returns void
     */
    init() {
        // Define this
        const vis = this;

        // Build svg, g
        vis.els.svg = d3.select(vis.lensing.overlay.container)
            .append('svg')
            .attr('class', 'compass_svg')
            .style('position', 'absolute')
            .style('transform', `translate3d(0, 0, 0) translate(${-(vis.configs.padding + vis.configs.offset)}px, 
                ${-(vis.configs.padding + vis.configs.offset)}px)`);
        vis.els.g = vis.els.svg.append('g')
            .attr('class', 'compass_g');

        // Attach component g's
        vis.els.offsetG = vis.els.g.append('g')
            .attr('class', 'compass_offset_g');
        vis.els.axesG = vis.els.offsetG.append('g')
            .attr('class', 'compass_axes_g')
            .style('transform', `translate(${vis.configs.padding}px, ${vis.configs.padding}px)`);
        vis.els.axisX = vis.els.axesG.append('g')
            .attr('class', 'compass_axis_x')
            .style('transform', `translateX(${vis.configs.offset}px)`);
        this.buildAxis(vis.els.axisX, vis.configs.tickCount, [0, vis.configs.tickSize])
        vis.els.axisY = vis.els.axesG.append('g')
            .attr('class', 'compass_axis_y')
            .style('transform', `translateY(${vis.configs.offset}px)`);
        this.buildAxis(vis.els.axisY, vis.configs.tickCount, [vis.configs.tickSize, 0])
        vis.els.labelG = vis.els.offsetG.append('g')
            .attr('class', 'compass_label_g')
            .style('transform', `translate(${vis.configs.labelPadding}px, ${vis.configs.labelPadding}px)`);
        vis.els.labelText = vis.els.labelG.append('text')
            .attr('class', 'compass_label_text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'rgba(255, 255, 255, 1)')
            .attr('font-size', 10)
            .style('transform', 'rotate(-45deg)');

    }

    /** 2.
     * @function wrangle
     *
     * @returns void
     */
    wrangle() {
        // Define this
        const vis = this;

        // Update config
        vis.configs.r = vis.lensing.configs.rad / vis.lensing.configs.pxRatio;
        vis.configs.w = vis.configs.h = (vis.configs.r + vis.configs.offset + vis.configs.padding) * 2;

        // If metadata not update
        if (vis.configs.dimsDigi.length === 0 || vis.configs.dimsPhys === 0) {

            // Configs
            vis.configs.dimsDigi = [
                vis.lensing.configs.imageMetadata.size_x,
                vis.lensing.configs.imageMetadata.size_y
            ];
            vis.configs.dimsPhys = [
                vis.lensing.configs.imageMetadata.physical_size_x,
                vis.lensing.configs.imageMetadata.physical_size_y
            ];
            vis.configs.unitPhysX = vis.lensing.configs.imageMetadata.physical_size_x_unit;
            vis.configs.unitPhysY = vis.lensing.configs.imageMetadata.physical_size_y_unit;

            // Unit conversion
            this.configs.unitConv = this.lensing.configs.compassUnitConversion

            // Scales
            vis.tools.scUnits
                .range([0, vis.configs.dimsPhys[0]])
                .domain([0, vis.configs.dimsDigi[0]]);
        }

        // Measure relative
        const screenPt1 = new this.lensing.osd.Point(0, 0);
        const screenPt2 =
            new this.lensing.osd.Point(this.configs.r * 2, 0);
        const contextPt1 =
            this.lensing.viewer.world.getItemAt(0).viewerElementToImageCoordinates(screenPt1);
        const contextPt2 =
            this.lensing.viewer.world.getItemAt(0).viewerElementToImageCoordinates(screenPt2)
        const diff = Math.round(contextPt2.x - contextPt1.x);

        // Discover dims
        const dim = vis.tools.scUnits(diff) * vis.configs.unitConv.inputOutputRatio[1]
            / this.configs.unitConv.inputOutputRatio[0];
        this.configs.dimsConv = [dim, dim];

        // Update scales
        this.tools.scDims
            .range([0, vis.configs.r * 2])
            .domain([-dim / 2, dim / 2]);
        this.tools.scTick

        // Check coordinate position - purpose:placement
        const x = this.lensing.configs.pos[0] / vis.lensing.configs.pxRatio -
            vis.lensing.viewer.canvas.clientWidth / 2;
        const y = this.lensing.configs.pos[1] / vis.lensing.configs.pxRatio -
            vis.lensing.viewer.canvas.clientHeight / 2;
        const deg = Math.atan2(y, x) * (180 / Math.PI) + 180;
        if (deg <= 90) {
            vis.configs.degFactor = 0;
        } else if (deg <= 180) {
            vis.configs.degFactor = 1;
        } else if (deg <= 270) {
            vis.configs.degFactor = 2;
        } else if (deg <= 360) {
            vis.configs.degFactor = 3;
        }

        vis.render()

    }

    /** 3.
     * @function render
     *
     * @returns void
     */
    render() {
        // Define this
        const vis = this;

        // Update svg size
        vis.els.svg.attr('width', vis.configs.w)
            .attr('height', vis.configs.h);
        const transform =
            `translate(${vis.configs.w / 2}px, ${vis.configs.h / 2}px) rotate(${vis.configs.degFactor * 90}deg)`;
        vis.els.g.transition(100).style('transform', transform);
        vis.els.offsetG.style('transform', `translate(${-vis.configs.w / 2}px, ${-vis.configs.h / 2}px)`);

        // Update scales
        vis.updateAxis(vis.els.axisX, [vis.configs.h - 2 * (vis.configs.offset + vis.configs.padding), 0]);
        vis.updateAxis(vis.els.axisY, [0, vis.configs.w - 2 * (vis.configs.offset + vis.configs.padding)]);

        // // Update axes
        // vis.els.axisX
        //     .transition()
        //     .call(
        //         vis.tools.axisX.ticks(3).scale(vis.tools.scDims)
        //     );
        // vis.els.axisY
        //     .transition()
        //     .call(
        //         vis.tools.axisY.ticks(3).scale(vis.tools.scDims)
        //     );
        // vis.els.axesG.selectAll('path')
        //     .attr('stroke', 'white')
        //     .attr('stroke-width', 0.5);
        // vis.els.axesG.selectAll('line')
        //     .attr('stroke', 'white')
        //     .attr('stroke-width', 0.5);
        // vis.els.axesG.selectAll('text')
        //     .attr('font-weight', 100)
        //     .attr('font-size', 8)
        //     .attr('fill', 'white');

        // Update label
        vis.els.labelText
            .style('transform', () => {
                if (vis.configs.degFactor <= 1) return 'rotate(-45deg)';
                return 'rotate(135deg)';
            })
            .html(`${vis.configs.dimsConv[0].toFixed(1)}&nbsp;${vis.configs.unitConv.outputUnit}` +
                `<tspan font-size="6" dx="1" dy="-4">2</tspan>`);

    }

    /**
     * @function buildAxis
     */
    buildAxis(group, ticks, dir) {
        group.append('line')
            .attr('class', 'compass_axis_line')
            .attr('x0', 0)
            .attr('y0', 0)
            .attr('y1', 0)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5);
        for (let i = 0; i < ticks; i++) {
            group.append('line')
                .attr('class', 'compass_axis_tick')
                .attr('x0', 0)
                .attr('y0', 0)
                .attr('x1', -dir[0])
                .attr('y1', -dir[1])
                .attr('stroke', 'white')
                .attr('stroke-width', 0.5);
        }
    }

    /**
     * @function updateAxis
     */
    updateAxis(group, dir) {
        group.select('.compass_axis_line')
            .attr('x1', dir[0])
            .attr('y1', dir[1]);
        group.selectAll('.compass_axis_tick')
            .each(function(d, i) {
                const tick = d3.select(this);
                if (dir[1] === 0) {
                } else {

                }
            })
    }
}
