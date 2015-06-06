import {Data} from "./data";
import {Store} from "./store";
import {$} from "./dom";

Function.prototype.curry = function curry() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function curryed() {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};

function assemble (literal, params) {
    return new Function(params, "return `"+literal+"`;"); // TODO: Proper escaping
}

function applyBinds (bindable, data) {
    var compiledTemplate = assemble(bindable.template, 'data');
    var content = compiledTemplate(data);

    bindable.element.innerHTML = content;
}

function initializeModelBinding(item) {

    var attribute = item.getAttribute('es-model').split('.')[1];

    function onChange(item, data) {
        var attribute = item.getAttribute('es-model').split('.')[1];
        data.value[attribute] = item.value;
    }

    $(item).on('keyup', onChange.curry(item, this.data));
    item.value = this.data.value[attribute];

    this.models.set(attribute, item);

}

function initializeFunction(item) {

    function handler(component) {
        var fnName = this.getAttribute('es-click');

        component[fnName].call(null, component);
    }

    $(item).on('click', handler.curry(this));
}

function initializeEsItems() {
    var items = $(this.shadow).find('[es-item]');

    Array.from(items).forEach((item) => {

        var attributes = Array.prototype.slice.call(item.attributes);

        attributes.forEach((attribute) => {

            switch (attribute.nodeName) {
                case 'es-click':
                    initializeFunction.call(this, item);
                    break;

                case 'es-model':
                    initializeModelBinding.call(this, item);
                    break;
            }
        });

    });

}

export class Component {

    constructor(params) {

        let clone;
        let element = document.createElement(params.element);

        this.key = Symbol("key");
        this.host = document.querySelector(params.host);
        this.host.appendChild(element);
        this.shadow = element.shadowRoot;
        this.models = new Map();

        this.data = new Data(this.key, params.scope);
        this.bindables = [];

        Object.assign(this, params.methods);

        initializeEsItems.call(this);

        Array.from($(this.shadow).find('.bindable')).forEach(item => {
            var bindable = {};

            bindable.element = item;
            bindable.template = item.innerHTML;

            this.bindables.push(bindable);

            applyBinds(bindable, this.data.value);
        });

        Object.observe(this.data.value, (changes) => {
            this.bindables.forEach((bindable) => {
                applyBinds(bindable, this.data.value);
            });

            changes.forEach((change) => {
                var model = this.models.get(change.name);
                model.value = change.object[change.name];
            });

        });
    }

    get key () {
        return this._key;
    }

    set key (key) {
        this._key = key;
    }

}
