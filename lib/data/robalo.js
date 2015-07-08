import * as Utils from "../utils";
import {Cardume} from "./cardume";


function setValues(item) {
    Object.keys(item).forEach((key) => {

        if (this[key] === item[key]) {
            return;
        }

        this.keys.push(key);

        if (Utils.isArray(item[key])) {
            this[key] = new Cardume(item);
            return;
        }

        if (item[key] instanceof Cardume) {
            this[key] = item[key];
            return;
        }

        if (item[key] && typeof item[key] === 'object') {
            this[key] = new Robalo(item[key]);
            return;
        }

        this[key] = item[key];
        if (this.baits && this.baits.length) {
            this.weGotSomethingMaster(key);
        }
    });
}

function fishCaught(callback) {

    var cb = callback;
    var self = this;

    return function (key, value) {

        cb([{
            name: key,
            object: self
        }]);
    }
}

function propagateBaits(fn) {
    this.keys.forEach((key) => {
        if (this[key] instanceof Cardume || this[key] instanceof Robalo) {
            this[key].throwBait(fishCaught.call(this, fn), key);
        }
    });
}

/**
 * jQuery like DOM class
 * @class
 */
export class Robalo {

    constructor(arg) {

        let data = {};

        this.keys = [];
        this.baits = [];

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

    /**
     * @method
     * @name addFisherman
     * @description
     * This is the entrypoint for a watcher... the fisherman is here waiting to get a f*cking fish!
     * We should iterate all the keys of this object, if its a Cardume or a lonely Robalo we should propagate the
     * baits (lets feed them! )
     * @param {Function} fn callback function
     */
    addFisherman(fn) {

        propagateBaits.call(this, fn);

        this.throwBait(fishCaught.call(this, fn));
    }

    /**
     * @method
     * @name throwBait
     * @description
     * The fisherman throws a lot of baits...
     * This is where we store all the callback for when changes occur
     * @param {Function} fn callback function
     * @param {string} key
     */
    throwBait(fn, key) {

        this.baits.push({
            fn: fn,
            key: key
        });

        propagateBaits.call(this, fn);
    }

    /**
     * @method
     * @name weGotSomethingMaster
     * @description
     * We have a fishy fishy nearby!
     * This means some change was made to the object and your baits should now trigger their callbacks (fishCaught)
     */
    weGotSomethingMaster(key) {
        this.baits.forEach((bait) => {
            bait.fn(bait.key || key, this);
        });
    }
};
