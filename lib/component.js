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

function initializeModelBindings(data, clone) {
    var models = $(clone).find('[es-model]');
    var result = new Map();

    function onChange(item, data) {
        var attribute = item.getAttribute('es-model').split('.')[1];
        data.value[attribute] = item.value;
    }

    Array.from(models).forEach(function (item) {

        var attribute = item.getAttribute('es-model').split('.')[1];

        $(item).on('keyup', onChange.curry(item, data));
        item.value = data.value[attribute];

        result.set(attribute, item);
    });

    return result;
}

export class Component {

    constructor(params) {

        let clone;
        let element = document.createElement(params.element);

        this.key = Symbol("key");
        this.host = document.querySelector(params.host);
        this.host.appendChild(element);
        this.shadow = element.shadowRoot;

        this.data = new Data(this.key, params.scope);
        this.bindables = [];

        this.models = initializeModelBindings(this.data, this.shadow);

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

        Object.assign(this, params.methods);
    }

    get key () {
        return this._key;
    }

    set key (key) {
        this._key = key;
    }

}
