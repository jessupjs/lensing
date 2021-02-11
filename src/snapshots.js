import {Subject, from} from 'rxjs';

/**
 * @class snapshots
 */
export default class Snapshots {

    // Class vars
    album = [];
    subject = null;

    /**
     * constructor
     */
    constructor(_lensing) {
        this.lensing = _lensing;

        // Add subject
        this.subject = new Subject();
    }

    /**
     * take_snapshot
     *
     * @returns void
     */
    take_snapshot() {
        this.album.push({
            date: new Date(),
            id: (new Date()).getTime(),
            imgData: this.lensing.imgData,
            lensingConfigs: JSON.parse(JSON.stringify(this.lensing.configs)),
            positionData: JSON.parse(JSON.stringify(this.lensing.position_data)),
        });

        // Update subject
        this.subject.next(this.album);

    }
}
