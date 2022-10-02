/**
 * @class Events
 */
export default class Events {

    // Class vars
    lensing = null;

    /**
     * @constructor
     */
    constructor(_lensing) {
        this.lensing = _lensing;
    }

    /** - TODO :: ck. 20220706
     * @function bulkAttachEvents
     * Attaches events to source viewer and hidden viewer
     *
     * @returns void
     */
    bulkAttachEvents() {

        // Click (or open)
        this.lensing.viewerAux.addHandler('animation', this.handleViewerAnimation.bind(this));
        this.lensing.viewerAux.addHandler('click', this.handleViewerAuxClick.bind(this));
        this.lensing.viewerAux.addHandler('open', this.handleViewerAuxOpen.bind(this));

        // // Zoom-ing or pan-ing
        this.lensing.viewer.addHandler('animation', this.handleViewerAnimation.bind(this));
        this.lensing.viewer.addHandler('canvas-drag', this.handleViewerCanvasDrag.bind(this));
        this.lensing.viewer.addHandler('open', this.handleViewerOpen.bind(this));
        this.lensing.viewer.addHandler('zoom', this.handleViewerZoom.bind(this));


        // Mouse-ing
        this.lensing.viewer.canvas.addEventListener('mouseover', this.handleViewerMouseover.bind(this));
        this.lensing.viewer.canvas.addEventListener('mousemove', this.handleViewerMousemove.bind(this));
        this.lensing.viewer.canvas.addEventListener('mouseout', this.handleViewerMouseout.bind(this));

        // Key-ing
        this.lensing.viewer.canvas.addEventListener('keydown', this.handleViewerKeydown.bind(this));

    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerAnimation
     * Manages hidden viewer zooming / positioning during zoom / pan events
     *
     * @returns void
     */
    handleViewerAnimation() {

        // Update some position data
        this.lensing.positionData.zoom = this.lensing.viewer.viewport.getZoom();
        this.lensing.positionData.zoomAux = this.lensing.viewerAux.viewport.getZoom();

        // If panning (dragging)
        if (this.lensing.positionData.screenCoords.length > 0) {
            this.lensing.setPosition(this.lensing.positionData.screenCoords);
        } else {
            this.lensing.manageLensUpdate();
        }
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerCanvasDrag
     * Manages drag
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerCanvasDrag(e) {

        // Get pos data from event
        this.lensing.positionData.currentEvent = 'pan';
        this.lensing.positionData.screenCoords = [Math.round(e.position.x), Math.round(e.position.y)];
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerMouseover
     * Turns on lens (if off), updates overlay and hidden viewer positions
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerMouseover(e) {

        // Turn on lens
        // this.configs.on = true;

        // Set hidden viewer and overlay pos
        this.lensing.positionData.screenCoords = [e.clientX - this.lensing.viewerAuxCanvas.getBoundingClientRect().x, e.clientY - this.lensing.viewerAuxCanvas.getBoundingClientRect().y];
        this.lensing.setPosition(this.lensing.positionData.screenCoords);

        // Update if not placed
        this.lensing.manageLensUpdate();
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerMousemove
     * Updates overlay and hidden viewer positions
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerMousemove(e) {

        // Set hidden viewer and overlay pos
        this.lensing.positionData.screenCoords = [e.clientX - this.lensing.viewerAuxCanvas.getBoundingClientRect().x, e.clientY - this.lensing.viewerAuxCanvas.getBoundingClientRect().y];
        this.lensing.setPosition(this.lensing.positionData.screenCoords);

        // If not placed
        this.lensing.manageLensUpdate();
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerMouseout
     * Turns off lens if not placed when mouse is outsider viewer
     *
     * @returns void
     */
    handleViewerMouseout() {

        // If outside of viewer, turn off mouse
        if (!this.lensing.configs.placed) {
            // this.configs.on = false;
        }
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerOpen
     * Initializes position settings from center
     *
     * @returns void
     */
    handleViewerOpen() {

        // Defaults
        this.lensing.positionData.refPoint = this.lensing.viewer.viewport.getCenter(false);
        this.lensing.positionData.centerPoint = this.lensing.viewer.viewport.getCenter(false);
        this.lensing.positionData.eventPoint = this.lensing.viewer.viewport.getCenter(false);
        this.lensing.positionData.zoom = this.lensing.viewer.viewport.getZoom(true);
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerZoom
     * Configures position data for zoom and raises hidden viewer click event
     *
     * @param {Event} e
     *
     * @returns null
     */
    handleViewerZoom(e) {

        // Update zoom data
        this.lensing.positionData.zoom = e.zoom;
        if (e.refPoint && e.refPoint.hasOwnProperty('x') && e.refPoint.hasOwnProperty('y')) {

            // Config
            this.lensing.positionData.currentEvent = 'zoom';
            this.lensing.positionData.screenCoords = [];

            // Emulate event
            this.lensing.positionData.refPoint = e.refPoint;
            this.lensing.viewerAux.raiseEvent('click', {eventType: 'zoom', immediately: false});
        } else {
            this.lensing.positionData.refPoint = this.lensing.viewer.viewport.getCenter(false);
        }
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerAuxClick
     * Adjusts zoom or pan based on an emulated event from scroll
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerAuxClick(e) {

        // Check if zoom or pan
        if (e.eventType === 'zoom' || !e.eventType) {
            if (this.lensing.positionData.zoom && this.lensing.positionData.refPoint && this.lensing.positionData.refPoint.hasOwnProperty('x') && this.lensing.positionData.refPoint.hasOwnProperty('y')) {

                // Diff variable
                const diff = this.lensing.viewerAuxCanvas.width / this.lensing.viewerCanvas.width;

                // Zoom
                this.lensing.viewerAux.viewport.zoomTo(this.lensing.positionData.zoom * this.lensing.configs.mag / diff, this.lensing.positionData.refPoint, e.immediately);
            }
        } else if (e.eventType === 'pan') {
            if (this.lensing.positionData.refPoint) {

                // Pan
                this.lensing.viewerAux.viewport.panTo(this.lensing.positionData.refPoint, e.immediately);
            }
        }

        // Events
        this.lensing.manageLensUpdate();
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerAuxOpen
     * Handles faux initialization click
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerAuxOpen(e) {

        // Fire click event
        this.handleViewerAuxClick(e);
    }

    /** - TODO :: ckpt. 20220706
     * @function handleViewerKeydown
     * Handles keyboard shortcuts
     *
     * @param {Event} e
     *
     * @returns void
     */
    handleViewerKeydown(e) {

        // Lens filter
        const keys_filter = ['{', '}', '|'];
        if (keys_filter.includes(e.key)) {
            // Specifics
            if (e.key === '{') {
                this.lensing.lenses.changeLens('prev', 'filter');
            } else if (e.key === '}') {
                this.lensing.lenses.changeLens('next', 'filter');
            } else if (e.key === '|') {
                this.lensing.lenses.changeLens('none', 'filter');
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manage_slider_update();
            this.lensing.manage_viewfinder_update();
            this.lensing.controls.updateReport();
            this.lensing.manageLensUpdate();
        }

        // Lens shape
        const keys_shape = ['L'];
        if (keys_shape.includes(e.key)) {
            // Specifics
            if (e.key === 'L') {
                if (this.lensing.configs.shape === 'circle') {
                    this.lensing.configs.shape = 'square';
                } else if (this.lensing.configs.shape === 'square') {
                    this.lensing.configs.shape = 'circle';
                }
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manageLensUpdate();
        }

        // Lens on
        const keys_onOff = ['l'];
        if (keys_onOff.includes(e.key)) {
            // Specifics
            if (e.key === 'l') {
                this.lensing.configs.on = !this.lensing.configs.on;
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manageLensUpdate();
        }

        // Lens sizing
        const keys_size = ['[', ']', '\\'];
        if (keys_size.includes(e.key)) {
            // Specifics
            if (e.key === '[') {
                if (this.lensing.configs.rad - this.lensing.configs.radInc >= this.lensing.configs.radMin) {
                    this.lensing.configs.rad -= this.lensing.configs.radInc;
                }
            } else if (e.key === ']') {
                if (this.lensing.configs.rad + this.lensing.configs.radInc <= this.lensing.configs.radMax) {
                    this.lensing.configs.rad += this.lensing.configs.radInc;
                }
            } else if (e.key === '\\') {
                this.lensing.configs.rad = this.lensing.configs.radDefault;
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manageLensUpdate();
        }

        // Lens placement
        const keys_dropFetch = ['p'];
        if (keys_dropFetch.includes(e.key)) {
            // Specifics
            if (e.key === 'p') {
                this.lensing.configs.placed = !this.lensing.configs.placed;
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manageLensUpdate();
        }

        // Lens placement
        const keys_opacity = ['o'];
        if (keys_opacity.includes(e.key)) {
            // Specifics
            if (e.key === 'o') {
                this.lensing.configs.opacity -= 0.25;
                if (this.lensing.configs.opacity === 0) {
                    this.lensing.configs.opacity = 1;
                }
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.manageLensUpdate();
        }

        // Lens magnification
        const keys_mag = ['m', ',', '.', '/'];
        if (keys_mag.includes(e.key)) {
            // Specifics
            if (e.key === 'm') {
                this.lensing.lenses.changeLens('next', 'magnifier');
                this.lensing.configs.mag = this.lensing.lenses.selections.magnifier.settings.active = this.lensing.lenses.selections.magnifier.settings.default;
            } else if (e.key === ',') {
                if (this.lensing.configs.mag - this.lensing.lenses.selections.magnifier.settings.step >= this.lensing.lenses.selections.magnifier.settings.min) {
                    this.lensing.configs.mag -= this.lensing.lenses.selections.magnifier.settings.step;
                    this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
                }
            } else if (e.key === '.') {
                if (this.lensing.configs.mag + this.lensing.lenses.selections.magnifier.settings.step <= this.lensing.lenses.selections.magnifier.settings.max) {
                    this.lensing.configs.mag += this.lensing.lenses.selections.magnifier.settings.step;
                    this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
                }
            } else if (e.key === '/') {
                this.lensing.configs.mag = this.lensing.lenses.selections.magnifier.settings.default;
                this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
            }
            // Generics
            this.lensing.configs.counterException = true;
            this.lensing.positionData.refPoint = this.lensing.positionData.eventPoint;
            this.lensing.positionData.zoom = this.lensing.viewer.viewport.getZoom(true);
            this.lensing.controls.updateReport();
            this.lensing.viewerAux.raiseEvent('click', {eventType: 'zoom', immediately: true});
        }

        // Lens compass
        const keys_compass = [';'];
        if (keys_compass.includes(e.key)) {
            // Specifics
            if (e.key === ';') {
                this.lensing.compass.updateVisibility();
            }
        }

        // Lens snapshot
        const keys_snapshot = ['D'];
        if (keys_snapshot.includes(e.key)) {
            // Specifics
            if (e.key === 'D') {
                this.lensing.snapshots.take_snapshot();
            }
        }


    }


}
