import {
    $
}
from "./dom";
import Interpolate from "./interpolate";

Function.prototype.curry = function curry() {
    var fn = this,
        args = Array.prototype.slice.call(arguments);
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
function assemble(literal, params) {
    return new Function(params, "return `" + literal + "`;"); // TODO: Proper escaping
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
function applyBinds(bindable, data) {

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

    var attribute = item.getAttribute('es-model');

    function onChange(item, data) {
        var attribute = item.getAttribute('es-model');
        data[attribute] = item.value;
    }

    $(item).on('keyup', onChange.curry(item, this.data));
    item.value = this.data[attribute];

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

    if (!items) {
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

function getAllBindableKeys(str) {
    var found = new Set();
    var rxp = /\${([^}]+)}/g;
    var curMatch;

    while (curMatch = rxp.exec(str)) {
        found.add(curMatch[1]);
    }

    return found;
}

function renderRepeat(bindable, data) {

    var data = this.data[bindable.key];

    bindable.element.innerHTML = '';

    data.forEach((item) => {
        let rowData = {
            [bindable.itemKey]: item
        };
        Object.assign(rowData, this.data);

        var content = Interpolate.compile(bindable.template, rowData);
        content = content.replace('es-bindable="es-bindable"', '');

        bindable.element.innerHTML += content;
    });
}

// //TODO: underconstruction
function initializeBindables() {

    var repeats = $(this.shadow).find('[es-repeat]');

    if (repeats && repeats.length) {

        Array.from(repeats).forEach((repeat) => {

            //Create bindable
            let bindable = {};
            let attrValue = repeat.getAttribute('es-repeat').split(' ');
            let dataItem = attrValue[2];
            let dataItemKey = attrValue[0];

            bindable.type = 'repeat';
            bindable.element = repeat;
            bindable.template = repeat.innerHTML;
            bindable.key = dataItem;
            bindable.itemKey = dataItemKey;

            renderRepeat.call(this, bindable);

            repeat.removeAttribute('es-repeat');

            this.bindables.push(bindable);
        });
    }

    var bindables = $(this.shadow).find('[es-bindable]');

    if (!bindables || !bindables.length) {
        return;
    }

    Array.from(bindables).forEach((item) => {
        let bindable = {};
        bindable.type = 'simple';
        bindable.element = item;
        bindable.template = item.innerHTML;
        bindable.keys = getAllBindableKeys(item.innerHTML);

        var content = Interpolate.compile(bindable.template, this.data);
        content = content.replace('es-bindable="es-bindable"', '');

        bindable.element.innerHTML = content;

        this.bindables.push(bindable);
    });
}

function bindChanges(self, change) {
    var bindables = [];

    self.bindables.forEach((bindable) => {

        if ((bindable.keys && bindable.keys.has(change.name)) || bindable.key === change.name) {
            bindables.push(bindable);
        }
    });

    bindables.forEach((bindable) => {

        if (bindable.type == 'repeat') {
            renderRepeat.call(self, bindable);
            return;
        }

        bindable.element.innerHTML = Interpolate.compile(bindable.template, self.data);
    });

    if (self.watchs.has(change.name)) {
        self.watchs.get(change.name)(change);
    }
}

function observableFn(self, changes) {

    changes.forEach((change) => {
        var model;

        bindChanges(self, change);

        model = self.models.get(change.name);
        if (model && model.value !== change.object[change.name]) {
            model.value = change.object[change.name];
        }
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

        let obj;

        this.watchs = new Map();

        obj = fn(this);

        this.element = document.createElement(obj.element);
        this.key = Symbol("key");
        this.models = new Map();
        this.bindables = [];
        this.data = obj.data;
    }

    /**
     * @method
     * @name initialize
     * @param {String} [params.host]
     * @description
     * This function will create the component initialize all the bindables and attach all the events
     */
    initialize(params) {

        this.shadow = this.element.shadowRoot;
        this.host = document.querySelector(params.host);
        this.host.appendChild(this.element);

        initializeBindables.call(this);
        initializeBindings.call(this);

        Object.observe(this.data, observableFn.curry(this));
    }

    watch(property, fn) {
        this.watchs.set(property, fn);
    }

    /**
     * @name destroy
     * @method
     * @description
     * This function is called to remove the component, it should remove the component from the dom
     * destroy the associated data and remove the observers
     */
    destroy() {

        //Remove from dom
        while (this.host.firstChild) {
            this.host.removeChild(this.host.firstChild);
        }

        //Remove observers
        Object.unobserve(this.data, observableFn);

        //Destroy data
        this.data = null;
    }

    get key() {
        return this._key;
    }

    set key(key) {
        this._key = key;
    }

}
