/*
Lensing
 */

class Lensing {

    // Class refs
    Filters = null;
    selFilter = 'go_natural';

    // Vars
    handle = null;
    viewer_canvas = null;
    test_canvas = null;
    overlay = null;

    // Configs
    lensR = 100;

    /*
    CONSTRUCTOR
     */
    constructor(_viewer) {
        this.viewer = _viewer;

        this.init();
    }

    /*
    INIT
     */
    init() {

        // Defs
        this.handle = this;
        this.viewer_canvas = this.viewer.hasOwnProperty('canvas')
            ? this.viewer.canvas.querySelector('canvas')
            : null;
        this.test_canvas = document.querySelector('#testCanvas'); // TODO - testing

        // Add event listeners to viewer
        if (this.viewer.hasOwnProperty('canvas')) {
            this.handle_attach_events(this.viewer.canvas);
        }

        // Build overlay
        this.overlay = this.build_overlay();

        // Instantiate Filters
        this.Filters = new LFilters();

        // Build FilterBox
        this.FilterBox = new LFilterBox(this, this.Filters.filters, 'testFilterBox');

    }

    /*
    build_overlay
     */
    build_overlay() {
        // Build container
        const container = document.createElement('div');
        container.setAttribute('class', 'lv_overlay_container');
        container.setAttribute('style', 'height: 100%; pointer-events: none; position: absolute; width: 100%;');

        // Build canvas
        const canvas = document.createElement('canvas');
        canvas.setAttribute('class', 'lv_overlay_canvas');
        if (this.viewer.hasOwnProperty('canvas')) {
            canvas.setAttribute('width', `${this.viewer.canvas.clientWidth * 2}`);
            canvas.setAttribute('height', `${this.viewer.canvas.clientHeight * 2}`);
        }
        canvas.setAttribute('style', 'height: 100%; pointer-events: none; position: absolute; width: 100%;');

        // Append canvas to container, container to viewer
        container.append(canvas);
        this.viewer.hasOwnProperty('canvas')
            ? this.viewer.canvas.parentNode.append(container)
            : null;

        // Return
        return {
            canvas: canvas,
            context: canvas.getContext('2d'),
            scale: 2
        };
    }

    /*
    draw_lens
     */
    draw_lens(data) {
        if (this.overlay.hasOwnProperty('context')) {
            // Clear
            this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
            // Draw
            this.overlay.context.strokeStyle = `white`;
            this.overlay.context.beginPath();
            this.overlay.context.arc(data.x, data.y, this.lensR, 0, Math.PI * 2, true);
            this.overlay.context.stroke();
            //this.overlay.context.fillStyle = `rgba(0, 0, 255, 0.5)`;
            //this.overlay.context.fill();
            // TODO - test
            const filteredD = this.Filters.filter(this.selFilter, data.d)
            const ctx = this.test_canvas.getContext('2d');
            ctx.putImageData(filteredD, this.lensR, this.lensR);
        }
    }

    /*
    handle_attach_events
     */
    handle_attach_events(viewer) {
        viewer.addEventListener('mousemove', this.handle_viewer_mousemove.bind(this))
    }

    /*
    handle_viewer_mouseover
     */
    handle_viewer_mouseover(e) {
        console.log(e)
    }

    /*
    handle_viewer_mousemove
     */
    handle_viewer_mousemove(e) {
        // Get some information from canvas
        const x = e.layerX * this.overlay.scale
        const y = e.layerY * this.overlay.scale
        const ctx = this.viewer_canvas.getContext('2d');
        const d = ctx.getImageData(x - this.lensR, y - this.lensR, this.lensR * 2, this.lensR * 2);
        this.draw_lens({
            x: x,
            y: y,
            d: d
        });
    }

    /*
    handle_viewer_mouseout
     */
    handle_viewer_mouseout(e) {
        console.log(e)
    }

}