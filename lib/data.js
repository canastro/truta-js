import Store from "./store";

export class Data {

    constructor (id, value) {
        this.id = id;
        this.value = value;

        Store.add(this);

        return this;
    }

    destroy () {
        Store.remove(this.id);
    }
}
