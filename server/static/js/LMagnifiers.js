/*
LMagnifiers
 */

class LMagnifiers {

    // Vars
    d = {data: null};

    /*
    CONSTRUCTOR
     */
    constructor() {
        this.sel_magnifier = this.magnifiers[0];
    }

    /*
    magnify
     */
    magnify(ref, filteredD) {

        // Do not need deep copy atm
        this.d = filteredD;

        // Discover filter
        const magnifier = this.magnifiers.find(f => f.name === ref);

        // Iterate and update
        this.d.copy = magnifier.update();
        this.d.data = this.d.copy.flat();

        // Return
        return this.d;
    }

    /*
    share_size
     */
    share_size(r) {
        this.r = r;
    }

    /*
    magnifiers
     */
    magnifiers = [
        // None
        {
            name: 'mag_none',
            vis_name: 'None',
            settings: {},
            update: () => {

            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        // Fisheye
        {
            name: 'mag_fisheye',
            vis_name: 'Fisheye',
            settings: {},
            update: () => {
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
    ];
}