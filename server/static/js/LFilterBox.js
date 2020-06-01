
/*
LfilterBox
 */

class LFilterBox {

    // Els
    svg = null;
    g = null;

    // Configs
    svgW = 50
    svgH = 0;
    gM = {top: 0, right: 0, bottom: 0, left: 0};
    gW = this.svgW - (this.gM.right + this.gM.left);
    gH = 0;
    r = 8;
    inc = 2;
    padding = 10;
    block = (this.r + this.padding) * 2;
    selected = 'go_natural';


    // CONSTRUCTOR
    constructor(_parent, _data, _target) {
        this.parent = _parent;
        this.data = _data;
        this.target = _target;
        // Init!
        this.init();
    }

    /*
    1. Init
     */
    init() {
        // Define this
        const vis = this;

        // Update dims
        vis.svgH = vis.data.length * vis.block + this.gM.top + this.gM.bottom;
        vis.gH = vis.svgH - (this.gM.top + this.gM.bottom);

        // Build
        vis.svg = d3.select(`#${vis.target}`)
            .append('svg')
            .attr('width', vis.svgW)
            .attr('height', vis.svgH);
        vis.g = vis.svg.append('g')
            .style('transform', `translate(${vis.gM.left}px, ${vis.gM.top}px)`);

        // Wrangle!
        this.wrangle();
    }

    /*
    2. Wrangle
     */
    wrangle() {
        // Render!
        this.render();
    }

    /*
    3. Render
     */
    render() {
        // Define this
        const vis = this;

        // Build
        vis.g.selectAll('.filterG')
            .data(vis.data)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'filterG')
                    .each(function(d, i) {
                        // Define this
                        const g = d3.select(this)
                            .style('transform', `translateY(${i * vis.block}px)`);
                        // Append circ 1 (ring)
                        const ring = g.append('circle')
                            .attr('class', 'filterCircRing')
                            .attr('r', vis.r + vis.inc)
                            .attr('cx', vis.block / 2)
                            .attr('cy', vis.block / 2)
                            .attr('fill', 'rgba(255, 255, 255, 1)')
                            .attr('stroke', 'rgba(0, 0, 0, 1)')
                            .attr('stroke-width', 0.2);
                        if (vis.selected === d.name) {
                            ring.style('opacity', 1);
                        } else {
                            ring.style('opacity', 0);
                        }
                        // Append circ 2
                        g.append('circle')
                            .attr('class', 'filterCirc')
                            .attr('r', vis.r)
                            .attr('cx', vis.block / 2)
                            .attr('cy', vis.block / 2)
                            .attr('fill', d.fill)
                            .attr('stroke', d.stroke)
                            .attr('stroke-width', 0.4);
                    })
                    .on('click', e => vis.updateFilter(e)),
                update => update
                    .each(function(d, i) {
                        // Define this
                        const g = d3.select(this);
                        // Append circ 1 (ring)
                        const ring = g.select('.filterCircRing');
                        if (vis.selected === d.name) {
                            ring.style('opacity', 1);
                        } else {
                            ring.style('opacity', 0);
                        }
                    }),
                exit => exit.remove()
            )
    }

    /*
    updateFilter
     */
    updateFilter(e) {
        // Update selected
        this.selected = e.name;
        this.parent.selFilter = e.name;
        // Force update
        this.parent.manage_lens_update(true);

        // Wrangle!
        this.wrangle();
    }

}