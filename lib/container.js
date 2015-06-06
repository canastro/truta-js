class Container {
    constructor() {
        this.components = new Map();
    }

    register(name, component) {
        this.components.set(name, component);
    }

    getContainerByName(name) {
        return this.components.get(name);
    }
}

let containerInstance = new Container();
export default containerInstance;
