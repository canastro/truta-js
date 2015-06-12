import {$} from './dom';

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
function assemble (literal, params) {
    return new Function(params, "return `"+literal+"`;"); // TODO: Proper escaping
}

class Interpolate {

    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.currentComponents = new Set();
    }

    //TODO: what if instead of es-repeat I just have a $index and I just update the index and repeat?
    // compile (template, data) {
    //
    //     //1. convert to document-fragment
    //     let range = document.createRange();
    //     let parseContext = document.body;
    //     range.selectNodeContents(parseContext);
    //     let fragment = range.createContextualFragment(template);
    //
    //     //2. extract all nodes where a es-repeat is defined
    //     let repeats = $(fragment).find('[es-repeat]');
    //
    //     if (repeats && repeats.length) {
    //         //3. iterate previously extracted DOM elements
    //         Array.from(repeats).forEach((repeat) => {
    //             let result = '';
    //
    //             //3.1 get innerHTML and create appropriate data structure
    //             let template = repeat.innerHTML;
    //
    //             //3.2 get data array
    //             let attrValue = repeat.getAttribute('es-repeat');
    //             let dataItem = attrValue.split(' ')[2];
    //             dataItem = dataItem.split('.');
    //             dataItem = dataItem.slice(1, dataItem.length);
    //             let innerData = data;
    //
    //             dataItem.forEach((item) => {
    //                 innerData = innerData[item]
    //             });
    //
    //             //3.2 call template thing n times
    //             innerData.forEach((item) => {
    //
    //                 let compiledTemplate = assemble(template, attrValue.split(' ')[0]);
    //                 let content = compiledTemplate(item);
    //
    //                 result += content;
    //             });
    //
    //             //3.3 set new innerHTML
    //             repeat.innerHTML = result;
    //         });
    //     }
    //
    //     Array.from($(fragment).find('[es-bindable]')).forEach(item => {
    //
    //         let compiledTemplate = assemble(item.innerHTML, 'data');
    //         let content = compiledTemplate(data);
    //
    //         item.innerHTML = content;
    //     });
    //
    //     // make new element, insert document fragment, then get innerHTML!
    //     var div = document.createElement('div');
    //     div.appendChild(fragment.cloneNode(true));
    //
    //     return div.innerHTML;
    // }

    compile (template, data) {

        var keys = Object.keys(data).join(',');
        var compiledTemplate = assemble(template, keys);
        var values = Object.keys(data).map(function(k){
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
    update () {

    }

}

let interpolateInstance = new Interpolate();
export default interpolateInstance;
