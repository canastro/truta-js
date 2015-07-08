import {Robalo} from "./robalo";
import * as Utils from "../utils";

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

    Array.prototype.forEach.call(this, (item) => {

        if (item instanceof Robalo || item instanceof Cardume) {
            this.baits.forEach((bait) => {
                item.throwBait(bait.fn, bait.key);
            });
        }
    });
}

export class Cardume {

    constructor(arg) {
        let data = [];

        this.baits = [];

        Object.assign(this, data);
    }

    add(item) {
        var robalo = new Robalo();
        robalo.set(item);

        Array.prototype.push.call(this, robalo);

        this.baits.forEach((bait) => {
            robalo.throwBait(bait.fn, bait.key);
        });

        this.weGotSomethingMaster();
    }

    remove(item) {
        var index = Array.prototype.indexOf.call(this, item);

        if (index > -1) {
            Array.prototype.splice.call(this, index, 1);
        }

        this.weGotSomethingMaster();
    }

    /**
     * @method
     * @name addFisherman
     * @description
     * This is the entrypoint for a watcher... the fisherman is here waiting to get a f*cking fish!
     * We should iterate all the items in the array, if they are Robalos, we should propagate this baits (lets feed them!)
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
        var baits = this.baits;

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
            bait.fn(bait.key || bait.key + '.' + key, this);
        });
    }
}
