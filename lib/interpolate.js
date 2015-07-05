import {
    $
}
from './dom';

/**
 * @method
 * @private
 * @name assemble
 * @param {String} literal - string to be converted to quasi-literal
 * @param {params} params - data source structure
 * @description
 * Hacky hacky to be able to use a string as a "template" with es6 quasi-literals
 * see: http://stackoverflow.com/questions/29771597/how-can-i-construct-a-template-string-from-a-regular-string?rq=1
 */
function assemble(literal, params) {
    return new Function(params, "return `" + literal + "`;"); // TODO: Proper escaping
}

class Interpolate {

    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.currentComponents = new Set();
    }

    compile(template, data) {

        var keys = Object.keys(data).join(',');
        var compiledTemplate = assemble(template, keys);
        var values = Object.keys(data).map(function (k) {
            return data[k]
        });
        var result;

        try {
            result = compiledTemplate.apply(this, values);
        } catch (evt) {
            result = template;
        }

        return result;
    }

    //TODO: this receives which was the update property
    update() {

    }

}

let interpolateInstance = new Interpolate();
export default interpolateInstance;
