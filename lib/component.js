import {Data} from "./data";
import {$} from "./dom";

Function.prototype.curry = function curry() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function curryed() {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};

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

/**
 * @method
 * @private
 * @name applyBinds
 * @param {Object} bindable - bindable object, where we're going to get the element
 * @param {Object} data - data to apply to template
 * @description
 * Grabs the template, compiles and executes it with the correspondant data and replaces bindable element content
 */
function applyBinds (bindable, data) {
    var compiledTemplate = assemble(bindable.template, 'data');
    var content = compiledTemplate(data);

    bindable.element.innerHTML = content;
}

/**
 * @method
 * @private
 * @name initializeModels
 * @param {Object} item - DOM element with the attribute es-model
 * @description
 * Given a element with es-model it will give it the initial value and bind a keyup event (need to add others in future, based on type of element)
 * to keep data in sync
 */
function initializeModels(item) {

    var attribute = item.getAttribute('es-model').split('.')[1];

    function onChange(item, data) {
        var attribute = item.getAttribute('es-model').split('.')[1];
        data.value[attribute] = item.value;
    }

    $(item).on('keyup', onChange.curry(item, this.data));
    item.value = this.data.value[attribute];

    this.models.set(attribute, item);

}

//TODO: atm I only allow es-click type event, but should give more options later
/**
 * @method
 * @private
 * @name initializeFunction
 * @param {Object} item - DOM element with the attribute es-click
 * @description
 * Given a element with es-click it will call the correspondant callback
 */
function initializeFunction(item) {

    function handler(component) {
        var fnName = this.getAttribute('es-click');

        component[fnName].call(null, component);
    }

    $(item).on('click', handler.curry(this));
}

/**
 * @method
 * @private
 * @name initializeBindings
 * @description
 * Will lookup in the shadow element for elements with tag es-item, and then will call the
 * appropriate initialization method
 */
function initializeBindings() {

    var items = $(this.shadow).find('[es-item]');

    if(!items) {
        return;
    }

    Array.from(items).forEach((item) => {

        var attributes = Array.prototype.slice.call(item.attributes);

        attributes.forEach((attribute) => {

            switch (attribute.nodeName) {
                case 'es-click':
                    initializeFunction.call(this, item);
                    break;

                case 'es-model':
                    initializeModels.call(this, item);
                    break;
            }
        });

    });
}

function observableFn(self, changes) {
    self.bindables.forEach((bindable) => {
        applyBinds(bindable, self.data.value);
    });

    changes.forEach((change) => {
        var model = self.models.get(change.name);
        model.value = change.object[change.name];
    });
}

export class Component {

    /**
    * @constructor
    * @param {Object} params set of component properties
    * @param {String} [params.element]
    * @param {String} [params.scope]
    * @param {String} [params.methods]
    */
    constructor(fn) {

        var obj = fn(this);

        this.elementKey = obj.element;
        this.originalData = Object.assign({}, obj.data);
    }

    /**
    * @method
    * @name initialize
    * @param {String} [params.host]
    * @description
    * This function will create the component initialize all the bindables and attach all the events
    */
    initialize (params) {

        let clone;
        let element = document.createElement(this.elementKey);

        this.key = Symbol("key");
        this.models = new Map();
        this.bindables = [];
        this.data = new Data(this.key, Object.assign({}, this.originalData));
        this.shadow = element.shadowRoot;
        this.host = document.querySelector(params.host);
        this.host.appendChild(element);

        initializeBindings.call(this);

        Array.from($(this.shadow).find('[es-bindable]')).forEach(item => {
            var bindable = {};

            bindable.element = item;
            bindable.template = item.innerHTML;

            this.bindables.push(bindable);

            applyBinds(bindable, this.data.value);
        });

        Object.observe(this.data.value, observableFn.curry(this));
    }

    /**
    * @name destroy
    * @method
    * @description
    * This function is called to remove the component, it should remove the component from the dom
    * destroy the associated data and remove the observers
    */
    destroy () {

        //Remove from dom
        while (this.host.firstChild) {
            this.host.removeChild(this.host.firstChild);
        }

        //Remove observers
        Object.unobserve(this.data.value, observableFn);

        //Destroy data
        this.data.destroy();
        this.data = null;
    }

    get key () {
        return this._key;
    }

    set key (key) {
        this._key = key;
    }

}
