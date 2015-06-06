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

    function onChange(item, data) {
        var attribute = item.getAttribute('es-model').split('.')[1];
        data.value[attribute] = item.value;
    }

    Array.from(models).forEach(function (item) {
        $(item).on('keyup', onChange.curry(item, data));
    });
}

export class Component {

    constructor(params) {

        let clone;

        this.key = Symbol("key");
        this.templateHost = document.querySelector(params.template);
        this.host = document.querySelector(params.host);
        this.shadow = this.host.createShadowRoot();
        this.data = new Data(1, params.scope);
        this.bindables = [];

        clone = document.importNode(this.templateHost.content, true);

        Array.from($(clone).find('.bindable')).forEach(item => {
            var bindable = {};

            bindable.element = item;
            bindable.template = item.innerHTML;

            this.bindables.push(bindable);

            applyBinds(bindable, this.data.value);
        });

        Object.observe(this.data.value, () => {
            this.bindables.forEach((item) => {
                applyBinds(item, this.data.value);
            });
        });

        initializeModelBindings(this.data, clone);

        this.shadow.appendChild(clone);
    }

}
