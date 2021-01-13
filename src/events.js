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

    /**
     * @function handle_viewer_keydown
     * Handles keyboard shortcuts
     *
     * @param {Event} e
     *
     * @returns void
     */
    handle_viewer_keydown(e) {

        // Lens filter
        const keys_filter = ['{', '}', '|'];
        if (keys_filter.includes(e.key)) {
            // Specifics
            if (e.key === '{') {
                this.lensing.lenses.change_lens('prev', 'filter');
            } else if (e.key === '}') {
                this.lensing.lenses.change_lens('next', 'filter');
            } else if (e.key === '|') {
                this.lensing.lenses.change_lens('none', 'filter');
            }
            // Generics
            this.lensing.configs.counter_exception = true;
            this.lensing.manage_slider_update();
            this.lensing.manage_viewfinder_update();
            this.lensing.controls.update_report();
            this.lensing.manage_lens_update();
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
            this.lensing.configs.counter_exception = true;
            this.lensing.manage_lens_update();
        }

        // Lens on
        const keys_onOff = ['l'];
        if (keys_onOff.includes(e.key)) {
            // Specifics
            if (e.key === 'l') {
                this.lensing.configs.on = !this.lensing.configs.on;
            }
            // Generics
            this.lensing.configs.counter_exception = true;
            this.lensing.manage_lens_update();
        }

        // Lens sizing
        const keys_size = ['[', ']', '\\'];
        if (keys_size.includes(e.key)) {
            // Specifics
            if (e.key === '[') {
                if (this.lensing.configs.rad - this.lensing.configs.rad_inc >= this.lensing.configs.rad_min) {
                    this.lensing.configs.rad -= this.lensing.configs.rad_inc;
                }
            } else if (e.key === ']') {
                if (this.lensing.configs.rad + this.lensing.configs.rad_inc <= this.lensing.configs.rad_max) {
                    this.lensing.configs.rad += this.lensing.configs.rad_inc;
                }
            } else if (e.key === '\\') {
                this.lensing.configs.rad = this.lensing.configs.rad_default;
            }
            // Generics
            this.lensing.configs.counter_exception = true;
            this.lensing.manage_lens_update();
        }

        // Lens placement
        const keys_dropFetch = ['p'];
        if (keys_dropFetch.includes(e.key)) {
            // Specifics
            if (e.key === 'p') {
                this.lensing.configs.placed = !this.lensing.configs.placed;
            }
            // Generics
            this.lensing.configs.counter_exception = true;
            this.lensing.manage_lens_update();
        }

        // Lens magnification
        const keys_mag = ['m', ',', '.', '/'];
        if (keys_mag.includes(e.key)) {
            // Specifics
            if (e.key === 'm') {
                this.lensing.lenses.change_lens('next', 'magnifier');
                this.lensing.configs.mag = this.lensing.lenses.selections.magnifier.settings.active =
                    this.lensing.lenses.selections.magnifier.settings.default;
            } else if (e.key === ',') {
                if (this.lensing.configs.mag - this.lensing.lenses.selections.magnifier.settings.step >=
                    this.lensing.lenses.selections.magnifier.settings.min) {
                    this.lensing.configs.mag -= this.lensing.lenses.selections.magnifier.settings.step;
                    this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
                }
            } else if (e.key === '.') {
                if (this.lensing.configs.mag + this.lensing.lenses.selections.magnifier.settings.step <=
                    this.lensing.lenses.selections.magnifier.settings.max) {
                    this.lensing.configs.mag += this.lensing.lenses.selections.magnifier.settings.step;
                    this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
                }
            } else if (e.key === '/') {
                this.lensing.configs.mag = this.lensing.lenses.selections.magnifier.settings.default;
                this.lensing.lenses.selections.magnifier.settings.active = this.lensing.configs.mag;
            }
            // Generics
            this.lensing.configs.counter_exception = true;
            this.lensing.position_data.refPoint = this.lensing.position_data.eventPoint;
            this.lensing.position_data.zoom = this.lensing.viewer.viewport.getZoom(true);
            this.lensing.controls.update_report();
            this.lensing.viewer_aux.raiseEvent('click', {eventType: 'zoom', immediately: true});
        }

        // Lens compass
        const keys_compass = [';'];
        if (keys_compass.includes(e.key)) {
            // Specifics
            if (e.key === ';') {
                this.lensing.compass.updateVisibility();
            }
        }
    }


}
