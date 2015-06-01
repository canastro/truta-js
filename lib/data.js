import {Store} from "./store";

export class Data {
    
    constructor(id, value) {
        this.id = id;
        this.value = value;
        
        var store = new Store();
        store.add(this);
        
        return this;
    }
}