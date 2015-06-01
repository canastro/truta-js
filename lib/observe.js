class NestedObserve {
    constructor(data, deep, callback) {
    }
}

export var Observe = (data, callback) => new NestedObserve(data, callback);