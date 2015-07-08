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
        this.triggerWatchers(key);
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
        this.watchers = [];

        Object.assign(this, data);
    }

    clear () {
        this.keys.forEach((key) => {
            delete this[key];
        });
    }

    triggerWatchers(key) {
        this.watchers.forEach((fn) => {
            fn([{
                name: key,
                object: this
            }]);
        });
    }

    set(item) {
        this.clear();
        setValues.call(this, item);
    }

    update(item) {
        setValues.call(this, item);
    }

    //TODO: need to workout how not to add repeated watchers and the name of the watchers
    //checkout what information I need to receive at Component -> bindChanges
    addWatcher(fn, name) {

        //If a wathcer is added to this property it should also be added to all the Robalo elements
        this.keys.forEach((key) => {
            if (this[key] instanceof Cardume || this[key] instanceof Robalo) {
                this[key].addWatcher(fn, name || key);
            }
        });

        this.watchers.push(fn);
    }
};
