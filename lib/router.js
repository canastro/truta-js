import Container from './container';
import {Component} from './component';

class Router {
    constructor() {
        this.states = new Map();


        window.onpopstate = function(event) {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
        };
    }

    state(name, params) {
        this.states.set(name, params);
    }

    start() {

        let items = this.states.get('');

        Object.keys(items).forEach((key) => {
            let componentData = Container.getContainerByName(items[key].component);
            componentData.host = `[es-view=${key}]`;

            let component = new Component(componentData);
            component.initialize();
        });
    }

}

let routerInstance = new Router();
export default routerInstance;
