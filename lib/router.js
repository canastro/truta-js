import Truta from './truta';

Function.prototype.curry = function curry() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function curryed() {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};

function getState () {

    let state;
    let hash = document.location.hash;
    hash = hash.substring(1, hash.length);

    state = this.states.get(hash);

    if (this.currentState === hash) {
        return false;
    }

    if(!state) {
        history.back();
        return false;
    }

    this.currentState = hash;

    return state;
}

function renderState(state) {

    Object.keys(state).forEach((key) => {
        let component = Truta.createComponentInstance(state[key].component);

        component.initialize({
            host: `[es-view=${key}]`
        });

        this.currentComponents.add(component);
    });
}

function onPopState(self, event) {

    let state = getState.call(self);

    if(!state) {
        return;
    }

    self.currentComponents.forEach((item) => {
        item.destroy();
    });
    self.currentComponents.clear();

    renderState.call(self, state);
}

class Router {

    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.currentComponents = new Set();


        window.onpopstate = onPopState.curry(this);
    }

    state(name, params) {
        this.states.set(name, params);

        return this;
    }

    start() {
        let state = getState.call(this);
        renderState.call(this, state);
    }

}

let routerInstance = new Router();
export default routerInstance;
