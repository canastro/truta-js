import {Robalo} from "./robalo";
import * as Utils from "../utils";

export class Cardume {

    constructor(arg) {
        let data = [];

        this.watchers = [];

        Object.assign(this, data);
    }

    triggerWatchers() {
        this.watchers.forEach((watcher) => {
            watcher.fn([{
                name: watcher.name,
                object: this
            }]);
        });
    }

    add(item) {
        var robalo = new Robalo();
        robalo.set(item);

        this.watchers.forEach((watcher) => {
            robalo.addWatcher(watcher.fn, watcher.name);
        });

        Array.prototype.push.call(this, robalo);
        this.triggerWatchers();
    }

    remove(item) {
        var index = Array.prototype.indexOf.call(this, item);

        if (index > -1) {
            Array.prototype.splice.call(this, index, 1);
        }

        this.triggerWatchers();
    }

    //TODO: need to workout how not to add repeated watchers and the name of the watchers
    //checkout what information I need to receive at Component -> bindChanges
    addWatcher(fn, name) {
        var watchers = this.watchers;

        watchers.push({
            fn: fn,
            name: name
        });

        Array.prototype.forEach.call(this, (item) => {

            if (item instanceof Robalo) {
                watchers.forEach((watcher) => {
                    item.addWatcher(watcher.fn, watcher.name);
                });
            }
        });
    }
}
