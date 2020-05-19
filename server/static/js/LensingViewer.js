/*
LensingViewer
 */

class LensingViewer {

    // Vars
    handle = null;
    viewer = null;
    overlay = null;

    // Configs
    lensR = 100;

    /*
    CONSTRUCTOR
     */
    constructor(_target, _imgpath) {
        this.target = _target;
        this.imgpath = _imgpath;

        this.init();
    }

    /*
    INIT
     */
    init() {

        // Define handle
        this.handle = this;

        // Instantiate viewer
        this.viewer = OpenSeadragon({
            id: this.target,
            prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
            tileSources: `./static/assets/${this.imgpath}`,
            homeFillsViewer: true,
            visibilityRatio: 1.0,
        });

        // Add event listeners to viewer
        this.viewer.hasOwnProperty('canvas')
            ? this.handle_attach_events(this.viewer.canvas)
            : console.log('Err. No Viewer canvas');

        // Build overlay
        this.overlay = this.build_overlay();

        // Setup canvas


    }

    /*
    build_overlay
     */
    build_overlay() {
        const container = document.createElement('div');
        container.setAttribute('class', 'lv_overlay_container');
        container.setAttribute('style', 'height: 100%; pointer-events: none; position: absolute; width: 100%;');
        const canvas = document.createElement('canvas');
        canvas.setAttribute('class', 'lv_overlay_canvas');
        if (this.viewer.hasOwnProperty('canvas')) {
        canvas.setAttribute('width', `${this.viewer.canvas.clientWidth * 2}`);
        canvas.setAttribute('height', `${this.viewer.canvas.clientHeight * 2}`);
        }
        canvas.setAttribute('style', 'height: 100%; pointer-events: none; position: absolute; width: 100%;');
        container.append(canvas);
        this.viewer.hasOwnProperty('canvas')
            ? this.viewer.canvas.parentNode.append(container)
            : null;
        return {
            canvas: canvas,
            context: canvas.getContext('2d'),
            scale: 2
        };
    }

    /*
    draw_lens
     */
    draw_lens(coords) {
        if (this.overlay.hasOwnProperty('context')) {
            // Clear
            this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
            // Draw
            this.overlay.context.strokeStyle = `white`;
            this.overlay.context.beginPath();
            this.overlay.context.arc(coords.x, coords.y, this.lensR, 0, Math.PI * 2, true);
            this.overlay.context.stroke();
            //this.overlay.context.fillStyle = `rgba(0, 0, 255, 0.5)`;
            //this.overlay.context.fill();
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
        let coords = {x: e.layerX * this.overlay.scale, y: e.layerY * this.overlay.scale};
        this.draw_lens(coords);
    }

    /*
    handle_viewer_mouseout
     */
    handle_viewer_mouseout(e) {
        console.log(e)
    }

}