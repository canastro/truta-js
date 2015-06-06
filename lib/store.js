class Store {
    constructor() {
        this.store = new Map();
    }

    add(item) {
        this.store.set(item.id, item);
    }

    get(id) {
        return this.store.get(id);
    }
}

let storeInstance = new Store();
export default storeInstance;
