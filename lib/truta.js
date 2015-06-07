import {Component} from './component';

class Truta {
    constructor() {
        this.components = new Map();
        this.providers = new Map();
    }

    bootstrap (urls) {

    }

    component(name, data) {
        this.components.set(name, data);
        return this;
    }

    provider(name, fn) {
        this.providers.set(name, fn);
        return this;
    }

    getComponentByName(name) {
        return new Component(this.components.get(name));
    }
}

let trutaInstance = new Truta();
export default trutaInstance;
