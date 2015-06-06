
/*
  * Setting up block level variable to store class state
  * , set's to null by default.
*/
let instance = null;

export class Store {
    constructor() {

        if(!instance){
              instance = this;
        }

        this.store = new Map();

        return instance;
    }

    add(item) {
        this.store.set(item.id, item);
    }

    get(id) {
        return this.store.get(id);
    }
}
