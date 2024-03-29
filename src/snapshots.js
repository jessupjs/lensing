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

        // Set position to update position coords
        // this.lensing.set_position(this.lensing.positionData.screenCoords);

        const obj = {
            date: new Date(),
            id: (new Date()).getTime(),
            imgData: this.lensing.imgData,
            lensingConfigs: JSON.parse(JSON.stringify(this.lensing.configs)),
            positionData: JSON.parse(JSON.stringify(this.lensing.positionData)),
        };
        this.album.push(obj);

        // Update subject
        this.subject.next(obj);

    }
}
