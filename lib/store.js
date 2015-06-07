class Store {
    constructor () {
        this.store = new Map();
    }

    add (item) {
        this.store.set(item.id, item);
    }

    get (id) {
        return this.store.get(id);
    }

    remove (id) {
        this.store.delete(id);
    }
}

let storeInstance = new Store();
export default storeInstance;
