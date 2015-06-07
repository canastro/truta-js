
export class Provider {

    /**
    * @constructor
    * @param {Function} fn - provider
    */
    constructor(fn) {

        fn(this);
    }
}
