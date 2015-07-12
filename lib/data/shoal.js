import {Fish} from "./fish";
import {SeeBass} from "./seebass";
import * as Utils from "../utils";

export class Shoal extends Fish {

    constructor(arg) {
        let data = [];

        super();

        Object.assign(this, data);
    }

    add(item) {

        console.log('add');

        var seeBass = new SeeBass();
        seeBass.set(item);

        Array.prototype.push.call(this, seeBass);

        this.baits.forEach((bait) => {
            seeBass.addFisherman(bait, 'shoal add');
        });

        this.activateBaits();
    }

    remove(item) {
        var index = Array.prototype.indexOf.call(this, item);

        if (index > -1) {
            Array.prototype.splice.call(this, index, 1);
        }

        this.activateBaits();
    }

    propagateBaits(bait) {

        Array.prototype.forEach.call(this, (item) => {

            if (item instanceof SeeBass || item instanceof Shoal) {
                // this.baits.forEach((bait) => {
                //     item.addFisherman(bait, 'shoal propagate');
                // });
                item.addFisherman(bait, 'seebass');
            }
        });
    }

}
