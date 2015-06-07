import {Component} from './component';

class Truta {
    constructor() {
        this.components = new Map();
        this.providers = new Map();
    }

    component(name, data) {

        let component = new Component(data);
        this.components.set(name, component);

        return this;
    }

    provider(name, fn) {
        this.providers.set(name, fn);
        return this;
    }

    getComponentByName(name) {
        return this.components.get(name);
    }
}

let trutaInstance = new Truta();
export default trutaInstance;
