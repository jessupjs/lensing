/*
Lensing
 */

import Compass from './compass';
import Controls from './controls';
import Events from './events';
import Lenses from './lenses';
import Viewfinder from './viewfinder';
import Snapshots from './snapshots';


/*
TODO -
  - Add in rotate
  - Make aux_viewer size of lens - tried ... bad performance
  - Refactor mouse events to OSD.MouseTracker
  - Update to handle async filters
*/

/**
 * @class Lensing
 *
 */
export default class Lensing {

    // Class refs
    compass = null;
    controls = null;
    events = null;
    lenses = null;
    viewfinder = null;

    // Components
    overlay = null;
    viewer = null;
    viewer_canvas = null;
    viewer_aux = null;
    viewer_aux_canvas = null;

    // Position data
    positionData = {
        centerPoint: null,
        currentEvent: '',
        pos: [],
        posFull: [],
        refPoint: null,
        eventPoint: null,
        screenCoords: [],
        zoom: 0,
        zoomAux: 0
    };

    // Configs
    configs = {
        compassOn: false,
        compassUnitConversion: null,
        counter: 0,
        counterControl: 2,
        counterException: false,
        imageMetadata: null,
        mag: 1,
        on: true,
        placed: false,
        px: '',
        pxData: null,
        pxRatio: 1,
        rad: 100,
        radDefault: 100,
        radInc: 10,
        radMin: 0,
        radMax: 400,
        shape: 'circle',
    }

    /**
     * @constructor
     */
    constructor(_osd, _viewer, _viewer_config, _lensing_config, _data_load) {
        this.osd = _osd;
        this.viewer = _viewer;
        this.viewer_config = _viewer_config;
        this.lensing_config = _lensing_config;
        this.data_load = _data_load;

        // Set lensing configs using device settings
        this.config_update(this.lensing_config)
        this.device_config();

        // Init
        this.init();
    }

    /**
     * 1.
     * @function init
     * Initializes the viewers, overlay, lenses and viewfinders
     *
     * @returns void
     */
    init() {

        // Build magnifier viewer (hidden viewer)
        this.viewer_aux = this.build_hidden_viewer();

        // Keep viewer canvas and aux canvas as a variable
        this.viewer_canvas = this.viewer.canvas.querySelector('canvas');
        this.viewer_aux_canvas = this.viewer_aux.canvas.querySelector('canvas');

        // Build lens overlay
        this.overlay = this.build_overlay('lens',
            [this.viewer.canvas.clientWidth, this.viewer.canvas.clientHeight]);

        // Instantiate filters / ck filters from data_load
        this.lenses = new Lenses(this);

        // Instantiate controls
        this.controls = new Controls(this);

        // Instantiate viewfinder
        this.viewfinder = new Viewfinder(this);

        // Instantiate compass
        this.compass = new Compass(this);

        // Instantiate snapshots
        this.snapshots = new Snapshots(this);

        // Ck filters / viewfinder setups from data_load
        if (this.data_load.length > 0) {
            this.analyze_data_load();
        }

        // Add event listeners to viewer
        this.events = new Events(this);
        this.attach_events();

    }

    /**
     * @function analyze_data_load
     * Reviews data_load and assigns relevant variables and filters
     *
     * @returns void
     */
    analyze_data_load() {
        this.data_load.forEach(d => {
            // Check for filter
            this.lenses.check_for_data_filter(d);
            // Check for viewfinder serup
            this.viewfinder.check_for_setup(d);
        })
    }

    /**
     * @function attach_events
     * Attaches event listeners to both viewers and the document
     *
     * @returns void
     */
    attach_events() {

        // Click (or open)
        this.viewer_aux.addHandler('animation', this.handle_viewer_animation.bind(this));
        this.viewer_aux.addHandler('click', this.handle_viewer_aux_click.bind(this));
        this.viewer_aux.addHandler('open', this.handle_viewer_aux_open.bind(this));

        // Zoom-ing or pan-ing
        this.viewer.addHandler('animation', this.handle_viewer_animation.bind(this));
        this.viewer.addHandler('canvas-drag', this.handle_viewer_canvasdrag.bind(this));
        this.viewer.addHandler('open', this.handle_viewer_open.bind(this));
        this.viewer.addHandler('pan', this.handle_viewer_pan.bind(this));
        this.viewer.addHandler('zoom', this.handle_viewer_zoom.bind(this));


        // Mouse-ing
        this.viewer.canvas.addEventListener('mouseover', this.handle_viewer_mouseover.bind(this));
        this.viewer.canvas.addEventListener('mousemove', this.handle_viewer_mousemove.bind(this));
        this.viewer.canvas.addEventListener('mouseout', this.handle_viewer_mouseout.bind(this));

        // Key-ing
        this.viewer.canvas.addEventListener('keydown', this.events.handle_viewer_keydown.bind(this.events));
    }

    /**
     * @function build_hidden_viewer
     * Builds a hidden (aux) viewer that is used to project filtered / magnified data
     *
     * @returns any
     */
    build_hidden_viewer() {

        // Update viewer positions
        const viewerEl = document.querySelector(`#${this.viewer_config.id}`)

        viewerEl.style.position = 'relative';

        // Instantiate viewer_magnify
        const viewer_aux = new this.osd(this.viewer_config);

        // Position
        const containers = viewerEl.querySelectorAll(`.openseadragon-container`);
        containers[0].classList.add('lensing-c_main');
        containers[0].style.position = 'relative';
        containers[1].classList.add('lensing-c_aux')
        containers[1].style.position = 'absolute';
        containers[1].style.visibility = 'hidden';

        // Return osd viewer
        return viewer_aux;
    }

    /**
     * @function build_overlay
     * Builds overlay, including canvas and svg
     *
     * @param {string} id
     * @param {array} dims
     *
     * @returns any
     */
    build_overlay(id, dims) {

        // Build container
        const container = document.createElement('div');
        container.setAttribute('class', `overlay_container_${id} overlay_container`);
        container.setAttribute('style',
            `pointer-events: none; position: absolute;`);
        // container.setAttribute('style',
        //     `height: ${dims[0]}px; pointer-events: none; position: absolute; width: ${dims[1]}px;`);

        // Append container
        this.viewer.canvas.append(container);

        // Build actualCanvas
        const actualCanvas = document.createElement('canvas');
        // actualCanvas.setAttribute('width', `${dims[0] * this.configs.pxRatio}`);
        // actualCanvas.setAttribute('height', `${dims[1] * this.configs.pxRatio}`);
        actualCanvas.setAttribute('style',
            'height: 100%; pointer-events: none; position: absolute; width: 100%;');

        // Append actualCanvas to container, container to viewer
        container.append(actualCanvas);

        // Return
        return {
            canvas: actualCanvas,
            container: container,
            context: actualCanvas.getContext('2d')
        };
    }

    /**
     * @function config_update
     * Updates configuration settings
     *
     * @param {any} config
     *
     * @returns void
     */
    config_update(config) {
        for (const [k, v] of Object.entries(config)) {
            if (this.configs.hasOwnProperty(k)) this.configs[k] = v;
        }
    }

    /**
     * @function device_config
     * Updates configurations using device pixel ratio
     *
     * @returns void
     */
    device_config() {

        // Pixel ratio
        const pxRatio = window.devicePixelRatio;

        // Configs pxRatio
        this.configs.pxRatio = pxRatio;
        this.configs.rad = Math.round(50 * pxRatio);
        this.configs.radDefault = Math.round(50 * pxRatio);
        this.configs.radInc = Math.round(5 * pxRatio);
        this.configs.radMax = Math.round(200 * pxRatio);

    }

    /**
     * @function draw_lens
     * Paints the overlay
     *
     * @param {any} data
     *
     * @returns void
     */
    draw_lens(data) {

        // if (this.configs.counter % this.configs.counter_control === 0 || this.configs.counter_exception) {
        if (this.configs.counter % this.configs.counterControl === 0 || this.configs.counterException || !this.configs.placed) {

            // Reset
            this.configs.counterException = false;

            // Place in
            requestAnimationFrame(() => {

                // Update overlay dims and position
                this.overlay.canvas.setAttribute('width', this.configs.rad * 2 + 'px');
                this.overlay.canvas.setAttribute('height', this.configs.rad * 2 + 'px');
                this.overlay.canvas.style.width = Math.ceil(this.configs.rad * 2 / this.configs.pxRatio) + 'px';
                this.overlay.canvas.style.height = Math.ceil(this.configs.rad * 2 / this.configs.pxRatio) + 'px';
                if (!this.configs.placed) {
                    this.overlay.container.style.left = Math.round((data.x - this.configs.rad) / this.configs.pxRatio) + 'px';
                    this.overlay.container.style.top = Math.round((data.y - this.configs.rad) / this.configs.pxRatio) + 'px';
                }

                // Clear
                this.overlay.context.clearRect(0, 0,
                    this.overlay.canvas.width, this.overlay.canvas.height);

                if (this.configs.on) {

                    // Save
                    this.overlay.context.save();

                    // Filter
                    let filteredD = this.lenses.modify(data.d);

                    // Save
                    this.imgData = filteredD;

                    // Convert to bitmap
                    createImageBitmap(filteredD).then(imgBitmap => {

                        // Clip
                        if (this.configs.shape === 'circle') {
                            this.overlay.context.beginPath();
                            this.overlay.context.arc(this.configs.rad, this.configs.rad, this.configs.rad, 0, Math.PI * 2);
                            this.overlay.context.clip();
                        }

                        // Draw
                        if (this.lenses.selections.magnifier.name === 'mag_standard') {
                            this.overlay.context.drawImage(imgBitmap,
                                0,
                                0,
                                this.configs.rad * 2,
                                this.configs.rad * 2
                            );
                        } else if (this.lenses.selections.magnifier.name === 'mag_fisheye') {
                            this.overlay.context.scale(1 / this.configs.mag, 1 / this.configs.mag)
                            this.overlay.context.drawImage(imgBitmap,
                                0,
                                0,
                                this.configs.rad * 2 * this.configs.mag,
                                this.configs.rad * 2 * this.configs.mag
                            );
                        } else if (this.lenses.selections.magnifier.name === 'mag_plateau') {
                            this.overlay.context.drawImage(imgBitmap,
                                -(this.configs.mag - 1) * this.configs.rad,
                                -(this.configs.mag - 1) * this.configs.rad,
                                this.configs.rad * 2 * this.configs.mag,
                                this.configs.rad * 2 * this.configs.mag
                            );
                        }

                        // Restore
                        this.overlay.context.restore();

                        // Lens border / stroke
                        this.overlay.context.strokeStyle = `white`;
                        this.overlay.context.lineWidth = this.configs.pxRatio;
                        this.overlay.context.beginPath();
                        if (this.configs.shape === 'circle') {
                            this.overlay.context.arc(this.configs.rad, this.configs.rad, this.configs.rad - 1, 0, Math.PI * 2);
                        } else if (this.configs.shape === 'square') {
                            this.overlay.context.strokeRect(1, 1, (this.configs.rad - 1) * 2, (this.configs.rad - 1) * 2);
                        }
                        this.overlay.context.stroke();

                    }).catch(err => console.log(err));

                } else {

                    // Update viewfinder
                    this.viewfinder.wrangle();
                }
            });
        }
        this.configs.counter++;
    }

    /**
     * @function handle_viewer_animation
     * Manages hidden viewer zooming / positioning during zoom / pan events
     *
     * @returns void
     */
    handle_viewer_animation(e) {

        // Update some position data
        this.positionData.zoom = this.viewer.viewport.getZoom();
        this.positionData.zoomAux = this.viewer_aux.viewport.getZoom();

        // If panning (dragging)
        if (this.positionData.screenCoords.length > 0) {
            this.set_position(this.positionData.screenCoords);
        } else {
            this.manage_lens_update();
        }
    }

    /**
     * @function handle_viewer_canvasdrag
     * Manages drag
     *
     * @param {Event} e
     *
     * @returns void
     */
    handle_viewer_canvasdrag(e) {

        // Get pos data from event
        this.positionData.currentEvent = 'pan';
        this.positionData.screenCoords = [Math.round(e.position.x), Math.round(e.position.y)];
    }

    /**
     * @function handle_viewer_mouseover
     * Turns on lens (if off), updates overlay and hidden viewer positions
     *
     * @param {Event} e
     *
     * @returns void
     */
    handle_viewer_mouseover(e) {

        // Turn on lens
        // this.configs.on = true;

        // Set hidden viewer and overlay pos
        this.positionData.screenCoords = [
            e.clientX - this.viewer_aux_canvas.getBoundingClientRect().x,
            e.clientY - this.viewer_aux_canvas.getBoundingClientRect().y
        ];
        this.set_position(this.positionData.screenCoords);

        // Update if not placed
        this.manage_lens_update();
    }

    /**
     * @function handle_viewer_mousemove
     * Updates overlay and hidden viewer positions
     *
     * @param {Event} e
     *
     * @returns void
     */
    handle_viewer_mousemove(e) {

        // Set hidden viewer and overlay pos
        this.positionData.screenCoords = [
            e.clientX - this.viewer_aux_canvas.getBoundingClientRect().x,
            e.clientY - this.viewer_aux_canvas.getBoundingClientRect().y
        ];
        this.set_position(this.positionData.screenCoords);

        // If not placed
        this.manage_lens_update();
    }

    /**
     * @function handle_viewer_mouseout
     * Turns off lens if not placed when mouse is outsider viewer
     *
     * @returns void
     */
    handle_viewer_mouseout() {

        // If outside of viewer, turn off mouse
        if (!this.configs.placed) {
            // this.configs.on = false;
        }
    }

    /**
     * @function handle_viewer_open
     * Initializes position settings from center
     *
     * @returns void
     */
    handle_viewer_open() {

        // Defaults
        this.positionData.refPoint = this.viewer.viewport.getCenter(false);
        this.positionData.centerPoint = this.viewer.viewport.getCenter(false);
        this.positionData.eventPoint = this.viewer.viewport.getCenter(false);
        this.positionData.zoom = this.viewer.viewport.getZoom(true);
    }

    /**
     * @function handle_viewer_zoom
     * Configures position data for zoom and raises hidden viewer click event
     *
     * @param {Event} e
     *
     * @returns null
     */
    handle_viewer_zoom(e) {

        // Update zoom data
        this.positionData.zoom = e.zoom;
        if (e.refPoint && e.refPoint.hasOwnProperty('x') && e.refPoint.hasOwnProperty('y')) {

            // Config
            this.positionData.currentEvent = 'zoom';
            this.positionData.screenCoords = [];

            // Emulate event
            this.positionData.refPoint = e.refPoint;
            this.viewer_aux.raiseEvent('click', {eventType: 'zoom', immediately: false});
        } else {
            this.positionData.refPoint = this.viewer.viewport.getCenter(false);
        }
    }

    /**
     * @function handle_viewer_pan
     * Configures position data for pan
     *
     * @param {Event} e
     *
     * @returns null
     */
    handle_viewer_pan(e) {

    }

    /**
     * @function handle_viewer_aux_click
     * Adjusts zoom or pan based on an emulated event from scroll
     *
     * @param {Event} e
     *
     * @returns void
     */
    handle_viewer_aux_click(e) {

        // Check if zoom or pan
        if (e.eventType === 'zoom' || !e.eventType) {
            if (this.positionData.zoom && this.positionData.refPoint
                && this.positionData.refPoint.hasOwnProperty('x')
                && this.positionData.refPoint.hasOwnProperty('y')) {

                // Diff variable
                const diff = this.viewer_aux_canvas.width / this.viewer_canvas.width;

                // Zoom
                this.viewer_aux.viewport.zoomTo(
                    this.positionData.zoom * this.configs.mag / diff,
                    this.positionData.refPoint,
                    e.immediately
                );
            }
        } else if (e.eventType === 'pan') {
            if (this.positionData.refPoint) {

                // Pan
                this.viewer_aux.viewport.panTo(this.positionData.refPoint, e.immediately);
            }
        }

        // Events
        this.manage_lens_update();
    }

    /*
    handle_viewer_aux_open
     */
    handle_viewer_aux_open(e) {

        // Fire click event
        this.handle_viewer_aux_click(e);
    }

    /**
     * @function manage_lens_update
     * Defines position configurations before redraw
     *
     * @returns void
     */
    manage_lens_update() {

        // Check pos and placement
        // if (this.positionData.pos.length > 0 && !this.configs.placed) {
        if (this.positionData.pos.length > 0) {

            // Get context, init data
            const ctx = this.viewer_aux_canvas.getContext('2d');
            let d = null;

            // Respond to magnifaction
            if (this.lenses.selections.magnifier.name === 'mag_standard') {
                let xy = this.configs.rad * 2;
                d = ctx.getImageData(
                    this.positionData.pos[0] - this.configs.rad,
                    this.positionData.pos[1] - this.configs.rad,
                    xy,
                    xy
                );
            } else {
                let xy = Math.round(this.configs.rad * 2 * this.configs.mag);
                d = ctx.getImageData(
                    this.positionData.pos[0] - this.configs.rad * this.configs.mag,
                    this.positionData.pos[1] - this.configs.rad * this.configs.mag,
                    xy,
                    xy
                );
            }

            // If data filter is on
            if (this.lenses.selections.filter.name.substring(0, 8) === 'fil_data') {
                this.set_pixel(ctx);
            }

            // If compass is on
            if (this.configs.compassOn) {
                this.compass.wrangle();
            }

            // Draw
            this.draw_lens({
                x: this.positionData.pos[0],
                y: this.positionData.pos[1],
                d: d
            });
        }
    }

    /**
     * @function manage_slider_update
     * Updates slider in controls bar
     *
     * @returns null
     */
    manage_slider_update() {

        // Get filter
        const filter = this.lenses.selections.filter;
        filter.settings.active = filter.settings.default;

        // Update controls slider
        this.controls.slider.max = filter.settings.max;
        this.controls.slider.value = filter.settings.default;
        this.controls.slider.step = filter.settings.step;
    }

    /**
     * @function manage_viewfinder_update
     * Updates viewfinder visibility
     *
     * @returns void
     */
    manage_viewfinder_update() {

        // If has setup, destroy
        if (this.viewfinder.setup) {
            this.viewfinder.refresh();
        }

        // Update viewfinder
        this.viewfinder.on = this.lenses.selections.filter.settings.vf;
        if (this.viewfinder.on) {

            // Set new setup and init
            this.viewfinder.setup =
                this.viewfinder.setups.find(s => s.name === this.lenses.selections.filter.settings.vf_setup);
            if (this.viewfinder.setup) {
                this.viewfinder.setup.init();
            }
        }
    }

    /**
     * @function set_pixel
     * Sets pixel for data configured for color
     *
     * @return void
     */
    set_pixel(ctx) {

        // Get single pixel info TODO - PoC work
        const px = ctx.getImageData(
            this.positionData.pos[0],
            this.positionData.pos[1],
            1,
            1
        );
        this.configs.pxCol = px.data[0] + '_' + px.data[1] + '_' + px.data[2];

        // Perform setup
        this.lenses.selections.filter.set_pixel(px)
    }

    /**
     * @function set_position
     * Converts mouse coords to viewport point for hidden layer if mag on; sets coordinate config for overlay
     *
     * @param {array} coords
     * @param {boolean} isPoint
     *
     * @returns void
     */
    set_position(coords, isPoint = false) {


        // Get some cords for overlay
        if (!this.configs.placed) {

            let x = Math.round(coords[0] * this.configs.pxRatio);
            let y = Math.round(coords[1] * this.configs.pxRatio);
            this.positionData.pos = [x, y];
            if (isPoint) {
                const reCoords = this.viewer.viewport.pixelFromPoint(coords);
                this.configs.pos = [
                    Math.round(reCoords.x * this.configs.pxRatio),
                    Math.round(reCoords.y * this.configs.pxRatio)
                ];
            }
        }

        // Transform coordinates to scroll point
        const point = new this.osd.Point(coords[0], coords[1]);
        this.positionData.eventPoint = isPoint ? coords : this.viewer.viewport.viewerElementToViewportCoordinates(point);
        const pos_full = this.viewer.world.getItemAt(0)
            ? this.viewer.world.getItemAt(0).viewportToImageCoordinates(this.positionData.eventPoint)
            : {x: 0, y: 0};
        this.positionData.posFull = [pos_full.x, pos_full.y];

        // Check for event point before calculating reference point
        this.positionData.centerPoint = this.viewer.viewport.getCenter(true);
        const gap = this.positionData.centerPoint.minus(this.positionData.eventPoint).divide(this.configs.mag);
        this.positionData.refPoint = this.positionData.eventPoint.plus(gap);

        // Emulate event
        this.viewer_aux.raiseEvent('click', {eventType: 'pan', immediately: true});
    }

    /**
     * updateConfigs
     */
    updateConfigs(newConfigs) {
        for (let [k, v] of Object.entries(newConfigs)) {
            this.configs[k] = v;
        }
    }

}

/*
Ref.
https://stackoverflow.com/questions/38384001/using-imagedata-object-in-drawimage
https://stackoverflow.com/questions/39665545/javascript-how-to-clip-using-drawimage-putimagedata
https://stackoverflow.com/questions/32681929/hook-into-openseadragon-with-custom-user-interface-device
 */
