import {Data} from "./data";
import {Store} from "./store";
import {$} from "./dom";

function assemble (literal, params) {
    return new Function(params, "return `"+literal+"`;"); // TODO: Proper escaping
}

function applyBinds (bindable, data) {
    var compiledTemplate = assemble(bindable.template, 'data');
    var content = compiledTemplate(data);

    bindable.element.innerHTML = content;
}

export class Component {

    constructor(params) {

        let shadow;
        let template;
        let clone;
        let store;
        let contents;
        let model;

        this.key = Symbol("key");
        this.templateHost = document.querySelector(params.template);
        this.host = document.querySelector(params.host);
        this.shadow = this.host.createShadowRoot();
        this.data = new Data(1, params.scope);
        this.bindables = [];

        clone = document.importNode(this.templateHost.content, true);

        store = new Store();

        Array.from($(clone).find('.bindable')).forEach(item => {
            var bindable = {};

            bindable.element = item;
            bindable.template = item.innerHTML;

            this.bindables.push(bindable);

            applyBinds(bindable, this.data.value);
        });

        this.shadow.appendChild(clone);

        Object.observe(this.data.value, () => {
            this.bindables.forEach((item) => {
                applyBinds(item, this.data.value);
            });
        });
    }

}
