import * as Utils from "../utils";

export class Fish {

    constructor() {
        this.baits = [];
        this.$id = Utils.generateGUID();
    }

    /**
     * @method
     * @name addFisherman
     * @description
     * This is the entrypoint for a watcher... the fisherman is here waiting to get a f*cking fish!
     * We should iterate all the keys of this object, if its a Shoal or a lonely SeeBass we should propagate the
     * baits (lets feed them! )
     * @param {Function} fn callback function
     */
    addFisherman(bait, where) {

        var foundBait = Utils.find(this.baits, {
            $id: bait.$id
        });

        if (foundBait) {
            return;
        }

        if (!bait.$id) {
            bait.$id = Utils.generateGUID();
            bait.fn = this.fishCaught.call(this, bait.fn);
        }

        this.baits.push(bait);

        this.propagateBaits.call(this, bait);
    }

    /**
     * @method
     * @name activateBaits
     * @description
     * We have a fishy fishy nearby!
     * This means some change was made to the object and your baits should now trigger their callbacks (fishCaught)
     */
    activateBaits(key) {
        var self = this;
        this.baits.forEach((bait) => {
            bait.fn(bait.key || key, self);
        });
    }

    fishCaught(callback) {

        var cb = callback;
        var self = this;

        return function (key, value) {

            cb([{
                name: key,
                object: self
            }]);
        }
    }
}
