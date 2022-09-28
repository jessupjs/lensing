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

    // Construct refs
    osd = null;
    viewer = null;
    viewerConfig = null;
    lensingConfig = null;
    dataLoad = null;

    // Class refs
    compass = null;
    controls = null;
    events = null;
    lenses = null;
    viewfinder = null;

    // Components
    overlay = null;
    viewerCanvas = null;
    viewerAux = null;
    viewerAuxCanvas = null;

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
        addOnBoxFilters: [],
        addOnBoxMagnifiers: [],
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
        showControls: false,
    }

    /**
     * @constructor
     */
    constructor(_osd, _viewer, _viewer_config, _lensing_config, _data_load) {

        // Arriving from source application
        this.osd = _osd;
        this.viewer = _viewer;
        this.viewerConfig = _viewer_config;
        this.lensingConfig = _lensing_config;
        this.dataLoad = _data_load;

        // Set configs passed in from source application
        this.configUpdate(this.lensingConfig);

        // Set configs based on source device
        this.deviceConfig();

        // Init
        this.init();
    }

    /** - TODO :: ckpt. 20220706
     * 1.
     * @function init
     * Initializes the viewers, overlay, lenses and viewfinders
     *
     * @returns void
     */
    init() {

        // Build magnifier viewer (hidden viewer)
        this.viewerAux = this.buildHiddenViewer();

        // Keep viewer canvas and aux canvas as a variable
        this.viewerCanvas = this.viewer.canvas.querySelector('canvas');
        this.viewerAuxCanvas = this.viewerAux.canvas.querySelector('canvas');

        // Build lens overlay
        this.overlay = this.buildOverlay('lens',
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

        // Ck filters / viewfinder setups from data_load - FIXME :: post-"Bare Bones"
        if (this.dataLoad.length > 0) {
            this.analyzeDataLoad();
        }

        // Add event listeners to viewer
        this.events = new Events(this);
        this.events.bulkAttachEvents();

    }

    /** - FIXME :: revisit when data is passed in (post-'bare bones' phase)
     * @function analyzeDataLoad
     * Reviews data_load and assigns relevant variables and filters
     *
     * @returns void
     */
    analyzeDataLoad() {
        // this.dataLoad.forEach(d => {
            // Check for filter
            // this.lenses.checkForDataFilter(d);
            // Check for viewfinder serup
            // this.viewfinder.check_for_setup(d);
        // })
    }

    /** - TODO :: ckpt. 20220706
     * @function buildHiddenViewer
     * Builds a hidden (aux) viewer that is used to project modified / magnified data
     *
     * @returns any
     */
    buildHiddenViewer() {

        // Update viewer positions
        const viewerEl = document.querySelector(`#${this.viewerConfig.id}`)

        viewerEl.style.position = 'relative';

        // Instantiate hidden viewer that matches configuration from source viewer
        const viewerAux = new this.osd(this.viewerConfig);

        // Position (0 index is original source viewer; 1 index is hidden viewer)
        const containers = viewerEl.querySelectorAll(`.openseadragon-container`);
        containers[0].classList.add('lensing-c_main');
        containers[0].style.position = 'relative';
        containers[1].classList.add('lensing-c_aux')
        containers[1].style.position = 'absolute';
        containers[1].style.top = '0';
        containers[1].style.left = '0';
        containers[1].style.visibility = 'hidden';

        // Return osd viewer
        return viewerAux;
    }

    /**
     * @function buildOverlay
     * Builds overlay, including canvas and svg
     *
     * @param {string} id
     * @param {array} dims
     *
     * @returns any
     */
    buildOverlay(id, dims) {

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

    /** - TODO :: ckpt. 20220706
     * @function configUpdate
     * Updates configuration settings passed from source application
     *
     * @param {any} config
     *
     * @returns void
     */
    configUpdate(config) {
        for (const [k, v] of Object.entries(config)) {
            if (this.configs.hasOwnProperty(k)) {
                this.configs[k] = v;
            }
        }
    }

    /** - TODO :: ckpt. 20220706
     * @function device_config
     * Updates configurations using device pixel ratio (housekeeping for different monitor resolutions)
     *
     * @returns void
     */
    deviceConfig() {

        // Pixel ratio
        const pxRatio = window.devicePixelRatio;

        // Configs pxRatio
        this.configs.pxRatio = pxRatio;
        this.configs.rad = Math.round(50 * pxRatio);
        this.configs.radDefault = Math.round(50 * pxRatio);
        this.configs.radInc = Math.round(5 * pxRatio);
        this.configs.radMax = Math.round(200 * pxRatio);
    }

    /** - TODO :: ckpt. 20220706
     * @function drawLens
     * Paints the overlay
     *
     * @param {any} data
     *
     * @returns void
     */
    drawLens(data) {

        // if (this.configs.counter % this.configs.counter_control === 0 || this.configs.counter_exception) {
        if (this.configs.counter % this.configs.counterControl === 0 || this.configs.counterException
            || !this.configs.placed) {

            // Reset
            this.configs.counterException = false;

            const animate = this.animate.bind(this, data);
            requestAnimationFrame(animate);
        }
        this.configs.counter++;
    }

    /**
     * @function animate
     * Requests Animation Frame
     *
     * @param {any} data
     *
     * @returns void
     */
    animate(data) {
        // Update overlay dims and position
        const px_ratio = this.configs.pxRatio;
        const diameter = this.configs.rad * 2;
        const canvas_diameter = diameter;
        const css_diameter =  Math.ceil(diameter / px_ratio) + 'px';
        const css_x = Math.round((data.x - this.configs.rad) / px_ratio) + 'px';
        const css_y = Math.round((data.y - this.configs.rad) / px_ratio) + 'px';

        if (this.overlay.canvas.width !== canvas_diameter) {
          this.overlay.canvas.setAttribute('width', canvas_diameter + 'px');
        }
        if (this.overlay.canvas.height !== canvas_diameter) {
          this.overlay.canvas.setAttribute('height', canvas_diameter + 'px');
        }
        this.overlay.canvas.style.width = css_diameter;
        this.overlay.canvas.style.height = css_diameter;

        if (!this.configs.placed) {
            this.overlay.container.style.left = css_x;
            this.overlay.container.style.top = css_y;
        }

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
    }

    /** - TODO :: ckpt. 20220706
     * @function manageLensUpdate
     * Defines position configurations before redraw
     *
     * @returns void
     */
    manageLensUpdate() {

        // Check pos and placement
        // if (this.positionData.pos.length > 0 && !this.configs.placed) {
        if (this.positionData.pos.length > 0) {

            // Get context, init data
            const ctx = this.viewerAuxCanvas.getContext('2d');
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

            // If data filter is on - FIXME :: post-"Bare bones"
            if (this.lenses.selections.filter.name.substring(0, 8) === 'fil_data') {
                this.setPixel(ctx);
            }

            // If compass is on - FIXME :: post-"Bare bones"
            if (this.configs.compassOn) {
                this.compass.wrangle();
            }

            // Draw
            this.drawLens({
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

    /** - TODO :: ckpt. 20220706
     * @function setPixel
     * Sets pixel for data configured for color
     *
     * @param {any} ctx
     *
     * @return void
     */
    setPixel(ctx) {

        // Get single pixel info TODO - PoC work
        const px = ctx.getImageData(
            this.positionData.pos[0],
            this.positionData.pos[1],
            1,
            1
        );
        this.configs.pxCol = px.data[0] + '_' + px.data[1] + '_' + px.data[2];

        // Perform setup
        this.lenses.selections.filter.setPixel(px, this, this.lenses)
    }

    /** - TODO :: ckpt. 20220706
     * @function setPosition
     * Converts mouse coords to viewport point for hidden layer if mag on; sets coordinate config for overlay
     *
     * @param {array} coords
     * @param {boolean} isPoint
     *
     * @returns void
     */
    setPosition(coords, isPoint = false) {


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
        this.positionData.eventPoint = isPoint
            ? coords
            : this.viewer.viewport.viewerElementToViewportCoordinates(point);
        const posFull = this.viewer.world.getItemAt(0)
            ? this.viewer.world.getItemAt(0).viewportToImageCoordinates(this.positionData.eventPoint)
            : {x: 0, y: 0};
        this.positionData.posFull = [posFull.x, posFull.y];

        // Check for event point before calculating reference point
        this.positionData.centerPoint = this.viewer.viewport.getCenter(true);
        const gap = this.positionData.centerPoint.minus(this.positionData.eventPoint).divide(this.configs.mag);
        this.positionData.refPoint = this.positionData.eventPoint.plus(gap);

        // Emulate event - FIXME :: consider automated events to events file
        this.viewerAux.raiseEvent('click', {eventType: 'pan', immediately: true});
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
