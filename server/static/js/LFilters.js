/*
LFilters
 */

class LFilters {

    // Vars
    d = {data: null};

    /*
    CONSTRUCTOR
     */
    constructor() {
    }

    /*
    filter
     */
    filter(ref, imgD) {
        // Do not need deep copy atm
        this.d = imgD;

        // Discover filter
        const filter = this.filters.find(f => f.name === ref);

        // Iterate and update
        for (let i = 0; i < this.d.data.length; i += 4) {
            filter.update(i);
        }

        return this.d;
    }

    filters = [
        {
            name: 'go_natural',
            update: (i) => {
            },
            fill: 'rgba(255, 255, 255, 0)',
            stroke: 'rgba(0, 0, 0, 1)'
        },
        {
            name: 'go_r-full',
            update: (i) => {
                this.d.data[i + 1] = 0;
                this.d.data[i + 2] = 0;
            },
            fill: 'rgba(255, 0, 0, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
        {
            name: 'go_g-full',
            update: (i) => {
                this.d.data[i] = 0;
                this.d.data[i + 2] = 0;
            },
            fill: 'rgba(0, 255, 0, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
        {
            name: 'go_b-full',
            update: (i) => {
                this.d.data[i] = 0;
                this.d.data[i + 1] = 0;
            },
            fill: 'rgba(0, 0, 255, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
        {
            name: 'go_r-less',
            update: (i) => {
                this.d.data[i] = 0;
            },
            fill: 'rgba(0, 255, 255, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
        {
            name: 'go_g-less',
            update: (i) => {
                this.d.data[i + 1] = 0;
            },
            fill: 'rgba(255, 0, 255, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
        {
            name: 'go_b-less',
            update: (i) => {
                this.d.data[i + 2] = 0;
            },
            fill: 'rgba(255, 255, 0, 1)',
            stroke: 'rgba(0, 0, 0, 0)'
        },
    ];

}