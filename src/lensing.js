/*
Lensing
 */

import Lenses from './lenses';

/*
TODO -
 1. Zoom quirks
 2. Use overlay and button constructors (but not sure why)
*/

export default class Lensing {

    // Class refs
    lenses = null;

    // Interactive features
    button = null;
    key_shift = false;

    // Components
    overlay = null;
    viewer_aux = null;
    viewer_aux_canvas = null;
    viewer = null;
    viewer_canvas = null;

    // Position data
    position_data = {
        centerPoint: null,
        eventPoint: null,
        refPoint: null,
        scrollPoint: null,
        scrollCoords: [],
        zoom: 0,
        zoomAux: 0,
        zoomDiv: 0
    };

    // Configs
    configs = {
        mag: 1,
        on: true,
        placed: false,
        pos: [],
        rad: 100,
        rad_default: 100,
        rad_inc: 10,
        rad_min: 0,
        rad_max: 400,
        shape: 'circle',
    }


    // Configs

    /*
    CONSTRUCTOR
     */
    constructor(_osd, _viewer, _viewer_config) {
        this.osd = _osd;
        this.viewer = _viewer;
        this.viewer_config = _viewer_config;

        // Init
        this.init();
    }

    /*
    1. INIT
     */
    init() {

        // Build magnifier viewer (hidden viewer)
        this.viewer_aux = this.build_hidden_viewer();

        // Get actual canvas els
        this.viewer_canvas = this.viewer.canvas.querySelector('canvas');
        this.viewer_aux_canvas = this.viewer_aux.canvas.querySelector('canvas');

        // Add event listeners to viewer
        this.attach_events();

        // Build overlay and button
        this.overlay = this.build_overlay('lens',
            [this.viewer.canvas.clientWidth, this.viewer.canvas.clientHeight]);
        //this.button = this.build_button(); TODO - turned off for now

        // Instantiate Filters, and send over current lens size
        this.lenses = new Lenses(this);
    }

    /*
    attach_events
     */
    attach_events() {

        // Click (or open)
        this.viewer_aux.addHandler('click', this.handle_viewer_aux_click.bind(this));
        this.viewer_aux.addHandler('open', this.handle_viewer_aux_open.bind(this));
        this.viewer_aux.addHandler('animation', this.handle_viewer_animation.bind(this));

        // Zoom-ing or pan-ing
        this.viewer.addHandler('animation', this.handle_viewer_animation.bind(this));
        this.viewer.addHandler('open', this.handle_viewer_open.bind(this));
        this.viewer.addHandler('pan', this.handle_viewer_pan.bind(this));
        this.viewer.addHandler('zoom', this.handle_viewer_zoom.bind(this));

        // Mouse-ing
        this.viewer.canvas.addEventListener('mouseover', this.handle_viewer_mouseovermove.bind(this));
        this.viewer.canvas.addEventListener('mousemove', this.handle_viewer_mouseovermove.bind(this));
        this.viewer.canvas.addEventListener('mouseout', this.handle_viewer_mouseout.bind(this));

        // Key-ing
        document.addEventListener('keydown', this.handle_viewer_keydown.bind(this));
        document.addEventListener('keyup', this.handle_viewer_keyup.bind(this));
    }

    /*
    build_button
     */
    build_button() {

        // Configs
        const w = 38;
        const iconW = 28;
        const iconLilW = 16;
        const iconPad = (w - iconW) / 2;
        const sliderWH = [iconW, iconW * 5];

        // Build container
        const container = document.createElement('div');
        container.setAttribute('style', `height: 100%; width: ${w}px; `
            + `position: absolute; right: 0; top: 0; `
            + `display: flex; flex-flow: column nowrap; align-items: center;`
        );

        // Append img
        this.viewer.canvas.parentElement.append(container);

        // Build icon
        const icon = document.createElement('img');
        icon.setAttribute('src', './assets/lensing_icon.svg');
        icon.setAttribute('alt', 'Lensing Icon');
        icon.setAttribute('style', `height: ${iconW}px; width: ${iconW}px; `
            + `position: relative; margin: ${iconPad}px;`
        );
        container.append(icon);

        // Build iconKeyboard
        const iconKeyboard = document.createElement('img');
        iconKeyboard.setAttribute('src', './assets/lensing_keyboard.svg');
        iconKeyboard.setAttribute('alt', 'Keyboard Icon');
        iconKeyboard.setAttribute('style', `height: ${iconLilW}px; width: ${iconLilW}px; `
            + `position: relative; margin: ${iconPad / 2}px;`
        );
        container.append(iconKeyboard);

        // Build iconFilterConfig
        const iconFilterConfig = document.createElement('img');
        iconFilterConfig.setAttribute('src', './assets/lensing_filter_config.svg');
        iconFilterConfig.setAttribute('alt', 'Keyboard Icon');
        iconFilterConfig.setAttribute('style', `height: ${iconLilW}px; width: ${iconLilW}px; `
            + `position: relative; margin: ${iconPad / 2}px;`
        );
        container.append(iconFilterConfig);

        // Build slider - TODO: style the range handle
        const slider = document.createElement('input');
        slider.setAttribute('type', 'range');
        slider.setAttribute('min', '0');
        slider.setAttribute('max', '255');
        slider.setAttribute('value', '127');
        slider.setAttribute('step', '1');
        slider.setAttribute('style', `width: ${sliderWH[1]}px; height: ${2}px; `
            + `position: relative; margin-top: ${sliderWH[1] / 2 + 10}px; `
            + `-webkit-appearance: none; appearance: none; transform: rotate(90deg); outline: white; `
            + `background-color: black;`
        );
        container.append(slider);

        // Add event
        slider.addEventListener('change', this.handle_slider_change.bind(this));

        // Return
        return {
            slider: slider
        };

    }

    /*
    build_hidden_viewer
     */
    build_hidden_viewer() {

        // Update viewer positions
        const viewerEl = document.querySelector(`#${this.viewer_config.id}`)
        viewerEl.style.position = 'relative';

        // Instantiate viewer_magnify
        const viewer_aux = new this.osd(this.viewer_config);

        // Position
        const containers = viewerEl.querySelectorAll(`.openseadragon-container`);
        containers[0].classList.add('o-c_main');
        containers[0].style.position = 'relative';
        containers[1].classList.add('o-c_aux')
        containers[1].style.position = 'absolute';
        containers[1].style.visibility = 'hidden';

        return viewer_aux;
    }

    /*
    build_overlays
     */
    build_overlay(id, dims) {

        // Build container
        const container = document.createElement('div');
        container.setAttribute('class', `overlay_container_${id} overlay_container`);
        container.setAttribute('style',
            `height: ${dims[0]}px; pointer-events: none; position: absolute; width: ${dims[1]}px;`);

        // Append container
        this.viewer.canvas.append(container);

        // Build canvas (actually div, imitating OpenSD's structure)
        const canvas = document.createElement('div');
        canvas.setAttribute('class', `overlay_canvas_${id} overlay_canvas`);
        canvas.setAttribute('style',
            `height: 100%; pointer-events: none; position: absolute; width: 100%`);

        // Append canvas
        container.append(canvas)

        // Build actualCanvas
        const actualCanvas = document.createElement('canvas');
        actualCanvas.setAttribute('width', `${dims[0] * 2}`);
        actualCanvas.setAttribute('height', `${dims[1] * 2}`);
        actualCanvas.setAttribute('style',
            'height: 100%; pointer-events: none; position: absolute; width: 100%;');

        // Append actualCanvas to container, container to viewer
        canvas.append(actualCanvas);

        // Return
        return {
            canvas_actual: actualCanvas,
            canvas: canvas,
            container: container,
            context: actualCanvas.getContext('2d'),
            scale: 2
        };
    }

    /*
    draw_lens
     */
    draw_lens(data) {

        // Place in
        requestAnimationFrame(() => {

            // Update
            this.overlay.canvas_actual.setAttribute('width', this.configs.rad * 2 + 'px');
            this.overlay.canvas_actual.setAttribute('height', this.configs.rad * 2 + 'px');
            this.overlay.canvas_actual.style.width = this.configs.rad * 2 / this.overlay.scale + 'px';
            this.overlay.canvas_actual.style.height = this.configs.rad * 2 / this.overlay.scale + 'px';
            this.overlay.canvas_actual.style.left = (data.x - this.configs.rad) / this.overlay.scale + 'px';
            this.overlay.canvas_actual.style.top = (data.y - this.configs.rad) / this.overlay.scale + 'px';

            // Clear s
            this.overlay.context.clearRect(0, 0,
                this.overlay.canvas_actual.width, this.overlay.canvas_actual.height);

            // Save
            this.overlay.context.save();

            // Filter
            let filteredD = this.lenses.modify(data.d);

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
                }
                // Restore
                this.overlay.context.restore();

                // Lens border / stroke
                this.overlay.context.strokeStyle = `white`;
                this.overlay.context.beginPath();
                if (this.configs.shape === 'circle') {
                    this.overlay.context.arc(this.configs.rad + 1, this.configs.rad + 1, this.configs.rad - 1, 0, Math.PI * 2);
                } else if (this.configs.shape === 'square') {
                    this.overlay.context.strokeRect(1, 1, (this.configs.rad - 1) * 2, (this.configs.rad - 1) * 2);
                }
                this.overlay.context.stroke();
            });
        });
    }

    /*
    handle_slider_change
     */
    handle_slider_change(e) {

        // Update val
        this.lenses.update_filter(e.target.value)
    }

    /*
    handle_viewer_animation
     */
    handle_viewer_animation() {

        // Update some position data
        this.position_data.zoom = this.viewer.viewport.getZoom();
        this.position_data.zoomAux = this.viewer_aux.viewport.getZoom();
        this.position_data.zoomDiv = this.position_data.zoomAux / this.position_data.zoom;

        // Update lens
        this.manage_lens_update();
    }

    /*
    handle_viewer_keydown
     */
    handle_viewer_keydown(e) {

        // Check shift
        if (e.keyCode === 16) {
            this.key_shift = true;
        }

        // SHIFT
        if (this.key_shift) {
            // Lens filter
            const keys_filter = [220, 219, 221];
            if (keys_filter.includes(e.keyCode)) {
                if (e.keyCode === 220) {
                    // '|'
                    this.lenses.change_lens('none', 'filter');
                } else if (e.keyCode === 219) {
                    // '{'
                    this.lenses.change_lens('prev', 'filter');
                } else if (e.keyCode === 221) {
                    // '}'
                    this.lenses.change_lens('next', 'filter');
                }
                this.manage_slider_update();
            }
            // Lens shape
            const keys_onOff = [76];
            if (keys_onOff.includes(e.keyCode)) {
                // 'L'
                if (e.keyCode === 76) {
                    if (this.configs.shape === 'circle') {
                        this.configs.shape = 'square';
                    } else if (this.configs.shape === 'square') {
                        this.configs.shape = 'circle';
                    }
                }
            }
        } else {
            // Lens sizing
            const keys_size = [220, 219, 221];
            if (keys_size.includes(e.keyCode)) {
                if (e.keyCode === 220) {
                    // '\'
                    this.configs.rad = this.configs.rad_default;
                } else if (e.keyCode === 219) {
                    // '['
                    if (this.configs.rad - this.configs.rad_inc >= this.configs.rad_min) {
                        this.configs.rad -= this.configs.rad_inc;
                    }
                } else if (e.keyCode === 221) {
                    // ']'
                    if (this.configs.rad + this.configs.rad_inc <= this.configs.rad_max) {
                        this.configs.rad += this.configs.rad_inc;
                    }
                }
            }
            // Lens placement
            const keys_dropFetch = [80];
            if (keys_dropFetch.includes(e.keyCode)) {
                // 'p'
                if (e.keyCode === 80) {
                    this.configs.placed = !this.configs.placed;
                }
            }
            // Lens on
            const keys_onOff = [76];
            if (keys_onOff.includes(e.keyCode)) {
                // 'l'
                if (e.keyCode === 76) {
                    this.configs.on = !this.configs.on;
                }
            }
            // Lens magnification
            const keys_mag = [77, 188, 190, 191];
            if (keys_mag.includes(e.keyCode)) {
                if (e.keyCode === 191) {
                    // '/'
                    this.configs.mag = this.lenses.selections.magnifier.settings.default;
                } else if (e.keyCode === 188) {
                    // ','
                    if (this.configs.mag - this.lenses.selections.magnifier.settings.step >=
                        this.lenses.selections.magnifier.settings.min) {
                        this.configs.mag -= this.lenses.selections.magnifier.settings.step;
                    }
                } else if (e.keyCode === 190) {
                    // '.'
                    if (this.configs.mag + this.lenses.selections.magnifier.settings.step <=
                        this.lenses.selections.magnifier.settings.max) {
                        this.configs.mag += this.lenses.selections.magnifier.settings.step;
                    }
                } else if (e.keyCode === 77) {
                    // 'm'
                    this.lenses.change_lens('next', 'magnifier');
                }

                // Emulate event
                this.position_data.refPoint = this.position_data.scrollPoint;
                this.viewer_aux.raiseEvent('click', {eventType: 'zoom', immediately: true});
            }
        }

        // Update lens
        this.manage_lens_update();
    }

    /*
    handle_viewer_keyup
     */
    handle_viewer_keyup(e) {
        // Check shift
        if (e.keyCode === 16) {
            this.key_shift = false;
        }
    }

    /*
    handle_viewer_mouseovermove
     */
    handle_viewer_mouseovermove(e) {

        // Check if lens on
        if (!this.configs.placed) {

            // Move to point
            const point = new this.osd.Point(e.layerX, e.layerY);
            this.position_data.scrollPoint = this.viewer.viewport.viewerElementToViewportCoordinates(point);
            const gap = this.position_data.eventPoint.minus(this.position_data.scrollPoint).divide(this.configs.mag);
            this.position_data.refPoint = this.position_data.scrollPoint.plus(gap);

            if (this.position_data.refPoint && this.configs.mag > 1) {
                // Emulate event
                this.viewer_aux.raiseEvent('click', {eventType: 'pan', immediately: true});
            }

            // Get some information from canvas
            const x = e.layerX * this.overlay.scale;
            const y = e.layerY * this.overlay.scale;
            this.configs.pos = [x, y];
        }
        this.manage_lens_update();
    }

    /*
    handle_viewer_mouseout
     */
    handle_viewer_mouseout(e) {
        if (!this.configs.placed) {
            this.hide_lens();
        }
    }

    /*
    handle_viewer_open
     */
    handle_viewer_open(e) {

        // Defaults
        this.position_data.refPoint = this.viewer.viewport.getCenter(false);
        this.position_data.eventPoint = this.viewer.viewport.getCenter(false);
        this.position_data.centerPoint = this.viewer.viewport.getCenter(false);
        this.position_data.scrollPoint = this.viewer.viewport.getCenter(false);
        this.position_data.zoom = this.viewer.viewport.getZoom(true);
    }

    /*
    handle_viewer_pan
     */
    handle_viewer_pan(e) {
        // Update zoom data
        if (e.center) {
            this.position_data.refPoint = e.center
            this.position_data.eventPoint = e.center;
        }

        // Emulate event
        this.viewer_aux.raiseEvent('click', {eventType: 'pan', immediately: false});
    }

    /*
    handle_viewer_zoom
     */
    handle_viewer_zoom(e) {
        // Update zoom data
        if (e.refPoint) {
            this.position_data.refPoint = e.refPoint;
            this.position_data.eventPoint = e.refPoint;
        } else {
            this.position_data.centerPoint = this.viewer.viewport.getCenter(false);
            this.position_data.refPoint = this.position_data.centerPoint;
            this.position_data.eventPoint = this.position_data.centerPoint;
        }
        this.position_data.zoom = e.zoom;

        // Emulate event
        this.viewer_aux.raiseEvent('click', {eventType: 'zoom', immediately: false});
    }

    /*
    handle_viewer_aux_click
     */
    handle_viewer_aux_click(e) {

        if (e.eventType === 'zoom' || !e.eventType) {
            if (this.position_data.zoom && this.position_data.refPoint
                && this.position_data.refPoint.hasOwnProperty('x')
                && this.position_data.refPoint.hasOwnProperty('y')) {

                // Zoom
                this.viewer_aux.viewport.zoomTo(
                    this.position_data.zoom * this.configs.mag,
                    this.position_data.refPoint,
                    e.immediately
                );
            }
        } else if (e.eventType === 'pan') {
            if (this.position_data.refPoint) {

                // Pan
                this.viewer_aux.viewport.panTo(this.position_data.refPoint, e.immediately);
            }
        }
        this.manage_lens_update();
    }

    /*
    handle_viewer_aux_open
     */
    handle_viewer_aux_open(e) {

        // Fire click event
        this.handle_viewer_aux_click(e);
    }

    /*
    hide_lens
     */
    hide_lens() {

        // Clear
        this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
    }

    /*
    manage_lens_update
     */
    manage_lens_update(force = false) {
        if (this.configs.on) {
            if ((this.configs.pos.length > 0 && !this.configs.placed) || force) {
                const ctx = this.viewer_aux_canvas.getContext('2d');
                let d = null;
                if (this.lenses.selections.magnifier.name === 'mag_standard') {
                    d = ctx.getImageData(
                        this.configs.pos[0] - this.configs.rad,
                        this.configs.pos[1] - this.configs.rad,
                        this.configs.rad * 2,
                        this.configs.rad * 2
                    );
                } else if (this.lenses.selections.magnifier.name === 'mag_fisheye') {
                    d = ctx.getImageData(
                        this.configs.pos[0] - this.configs.rad * this.configs.mag,
                        this.configs.pos[1] - this.configs.rad * this.configs.mag,
                        this.configs.rad * 2 * this.configs.mag,
                        this.configs.rad * 2 * this.configs.mag
                    );
                }
                this.draw_lens({
                    x: this.configs.pos[0],
                    y: this.configs.pos[1],
                    d: d
                });
            }
        } else {
            this.hide_lens();
        }
    }

    /*
    manage_slider_update
     */
    manage_slider_update() {

        // Get filter
        const filter = this.lenses.selections.filter;

        // Update button slider
        this.button.slider.min = filter.settings.min;
        this.button.slider.max = filter.settings.max;
        this.button.slider.value = filter.settings.default;
        this.button.slider.step = filter.settings.step;
    }

}

/*
Ref.
https://stackoverflow.com/questions/38384001/using-imagedata-object-in-drawimage
https://stackoverflow.com/questions/39665545/javascript-how-to-clip-using-drawimage-putimagedata
https://stackoverflow.com/questions/32681929/hook-into-openseadragon-with-custom-user-interface-device
 */