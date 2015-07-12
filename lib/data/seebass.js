import * as Utils from "../utils";
import {Fish} from "./fish";
import {Shoal} from "./shoal";


function setValues(item) {
    Object.keys(item).forEach((key) => {

        if (this[key] === item[key]) {
            return;
        }

        this.keys.push(key);

        if (Utils.isArray(item[key])) {
            this[key] = new Shoal(item);
            return;
        }

        if (item[key] instanceof Shoal) {
            this[key] = item[key];
            return;
        }

        if (item[key] && typeof item[key] === 'object') {
            this[key] = new SeeBass(item[key]);
            return;
        }

        this[key] = item[key];

        if (this.baits && this.baits.length) {
            this.activateBaits(key);
        }
    });
}

/**
 * jQuery like DOM class
 * @class
 */
export class SeeBass extends Fish {

    constructor(arg) {

        let data = {};

        super();

        this.keys = [];

        Object.assign(this, data);
    }

    clear () {
        this.keys.forEach((key) => {
            delete this[key];
        });
    }

    set(item) {
        this.clear();
        setValues.call(this, item);
    }

    update(item) {
        setValues.call(this, item);
    }

    propagateBaits(bait) {
        this.keys.forEach((key) => {

            if (this[key] instanceof Shoal || this[key] instanceof SeeBass) {
                bait.key = key;
                this[key].addFisherman(bait, 'seebass');
            }
        });
    }
};
