/*
Lensing
 */

/*
TODO -
 1. Update lens on viewer zoom and pan events - DONE
 2. Lens sizing ('[' ']' '\ - DONE
 3. Lens placement ('p') - DONE
 4. Lens filters ('{' '}' '}') - DONE
 5. Lens on-off ('l') - DONE
 6. Lens shape ('L') - DONE
 7. Magnification ('M' ',' '.' '/')
   - Need to clone Seadragon viewer
*/

class Lensing {

    // Class refs
    Filters = null;
    selFilter = 'go_natural';

    // Vars
    handle = null;
    key_shift = false;
    lens_on = true;
    lens_pos = [];
    lens_shape = 'circle';
    mobile_lens = true;
    overlay = {context: null};
    test_canvas = null;
    viewer_canvas = null;

    // Configs
    lensR_default = 100;
    lensR = 100;
    lensR_inc = 10;
    lensR_min = 0;
    lensR_max = 400;
    lensMag_default = 1;
    lensMag = 1;
    lensMag_inc = 0.5;
    lensMag_min = 1;
    lensMag_max = 10;

    /*
    CONSTRUCTOR
     */
    constructor(_viewer) {
        this.viewer = _viewer;

        // Init
        this.init();
    }

    /*
    1. INIT
     */
    init() {

        // Defs
        this.handle = this;
        this.viewer_canvas = this.viewer.hasOwnProperty('canvas')
            ? this.viewer.canvas.querySelector('canvas')
            : null;
        this.test_canvas = document.querySelector('#testCanvas'); // TODO - testing

        // Add event listeners to viewer
        this.handle_attach_events();

        // Build overlay
        this.overlay = this.build_overlay();

        // Instantiate Filters and FilterBox
        this.Filters = new LFilters();
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
            ? this.viewer.canvas.append(container)
            : null;

        // Return
        return {
            canvas: canvas,
            context: canvas.getContext('2d'),
            scale: 2
        };
    }

    /*
    change_filter
     */
    change_filter(dir) {
        this.selFilter = this.Filters.get_filter(dir, this.selFilter);
    }

    /*
    draw_lens
     */
    draw_lens(data) {
        if (this.overlay.hasOwnProperty('context')) {
            // Clear
            this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
            // Save
            this.overlay.context.save();
            // Filter
            const filteredD = this.Filters.filter(this.selFilter, data.d)
            // Convert to bitmap
            createImageBitmap(filteredD).then(imgBitmap => {
                // Clip
                if (this.lens_shape === 'circle') {
                    this.overlay.context.beginPath();
                    this.overlay.context.arc(data.x, data.y, this.lensR, 0, Math.PI * 2);
                    this.overlay.context.clip();
                }
                // Draw
                this.overlay.context.drawImage(imgBitmap, data.x - this.lensR * this.lensMag,
                    data.y - this.lensR * this.lensMag,
                    this.lensR * this.lensMag * 2,
                    this.lensR * this.lensMag * 2);
                // Restore
                this.overlay.context.restore();
            });
            // Lens border
            this.overlay.context.strokeStyle = `white`;
            this.overlay.context.beginPath();
            if (this.lens_shape === 'circle') {
                this.overlay.context.arc(data.x, data.y, this.lensR, 0, Math.PI * 2);
            } else if (this.lens_shape === 'square') {
                this.overlay.context.strokeRect(data.x - this.lensR, data.y - this.lensR, this.lensR * 2, this.lensR * 2);
            }
            this.overlay.context.stroke();
        }
    }

    /*
    hide_lens
     */
    hide_lens() {
        if (this.overlay.hasOwnProperty('context')) {
            // Clear
            this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        }
    }

    /*
    handle_attach_events
     */
    handle_attach_events() {
        // Zoom-ing or pan-ing TODO - cannot set passive to false (warning in console)
        this.viewer.addHandler('animation', this.handle_viewer_change.bind(this), {passive: false});
        // Mouse-ing
        this.viewer.canvas.addEventListener('mouseover', this.handle_viewer_mouseovermove.bind(this));
        this.viewer.canvas.addEventListener('mousemove', this.handle_viewer_mouseovermove.bind(this));
        this.viewer.canvas.addEventListener('mouseout', this.handle_viewer_mouseout.bind(this));
        // Key-ing
        document.addEventListener('keydown', this.handle_viewer_keydown.bind(this));
        document.addEventListener('keyup', this.handle_viewer_keyup.bind(this));
    }

    /*
    handle_viewer_change
     */
    handle_viewer_change(e) {
        this.manage_lens_update();
    }

    /*
    handle_viewer_keydown
     */
    handle_viewer_keydown(e) {
        // console.log(e.keyCode);

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
                    this.change_filter('none');
                } else if (e.keyCode === 219) {
                    this.change_filter('prev');
                } else if (e.keyCode === 221) {
                    this.change_filter('next');
                }
            }
            // Lens shape
            const keys_onOff = [76];
            if (keys_onOff.includes(e.keyCode)) {
                if (e.keyCode === 76) {
                    if (this.lens_shape === 'circle') {
                        this.lens_shape = 'square';
                    } else if (this.lens_shape === 'square') {
                        this.lens_shape = 'circle';
                    }
                }
            }
        } else {
            // Lens sizing
            const keys_size = [220, 219, 221];
            if (keys_size.includes(e.keyCode)) {
                if (e.keyCode === 220) {
                    this.lensR = this.lensR_default;
                } else if (e.keyCode === 219) {
                    if (this.lensR - this.lensR_inc >= this.lensR_min) {
                        this.lensR -= this.lensR_inc;
                    }
                } else if (e.keyCode === 221) {
                    if (this.lensR + this.lensR_inc <= this.lensR_max) {
                        this.lensR += this.lensR_inc;
                    }
                }
            }
            // Lens placement
            const keys_dropFetch = [80];
            if (keys_dropFetch.includes(e.keyCode)) {
                if (e.keyCode === 80) {
                    this.mobile_lens = !this.mobile_lens;
                }
            }
            // Lens on
            const keys_onOff = [76];
            if (keys_onOff.includes(e.keyCode)) {
                if (e.keyCode === 76) {
                    this.lens_on = !this.lens_on;
                }
            }
            // Lens magnification
            const keys_mag = [188, 190, 191];
            if (keys_mag.includes(e.keyCode)) {
                console.log('hi')
                if (e.keyCode === 191) {
                    this.lensMag = this.lensMag_default;
                } else if (e.keyCode === 188) {
                    if (this.lensMag - this.lensMag_inc >= this.lensMag_min) {
                        this.lensMag -= this.lensMag_inc;
                    }
                } else if (e.keyCode === 190) {
                    if (this.lensMag + this.lensMag_inc <= this.lensMag_max) {
                        this.lensMag += this.lensMag_inc;
                    }
                }
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
        if (this.mobile_lens) {
            // Get some information from canvas
            const x = e.layerX * this.overlay.scale;
            const y = e.layerY * this.overlay.scale;
            this.lens_pos = [x, y];
        }
        this.manage_lens_update();
    }

    /*
    handle_viewer_mouseout
     */
    handle_viewer_mouseout(e) {
        if (this.mobile_lens) {
            this.hide_lens();
        }
    }

    /*
    manage_lens_update
     */
    manage_lens_update(force = false) {
        if (this.lens_on) {
            if ((this.lens_pos.length > 0 && this.mobile_lens) || force) {
                const ctx = this.viewer_canvas.getContext('2d');
                const d = ctx.getImageData(this.lens_pos[0] - this.lensR, this.lens_pos[1] - this.lensR,
                    this.lensR * 2, this.lensR * 2);
                this.draw_lens({
                    x: this.lens_pos[0],
                    y: this.lens_pos[1],
                    d: d
                });
            }
        } else {
            this.hide_lens();
        }
    }

}

/*
Ref.
https://stackoverflow.com/questions/38384001/using-imagedata-object-in-drawimage
https://stackoverflow.com/questions/39665545/javascript-how-to-clip-using-drawimage-putimagedata
 */