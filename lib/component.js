import {
    $
}
from "./dom";
import Interpolate from "./interpolate";
import * as Utils from "./utils";

var inputs = {
    'checkbox': {
        'change': 'change',
        'value': 'checked',
        'default': false
    },
    '': {
        'change': 'keyup',
        'value': 'value'
    }
}

function findDataItem(itemId, bindable, attribute) {

    var result;

    Array.from(this.data[bindable.key]).some((dataItem) => {
        if (dataItem.$id === itemId) {
            result = Utils.getDataByKey(dataItem, attribute);
            return true;
        }
    });

    return result;
}

function setShowModel(attribute, item) {
    var itemId = item.getAttribute('es-id');
    var bindableKey = attribute.split('.')[0];
    var bindableFound = Utils.find(this.bindables, {
        itemKey: bindableKey
    });
    var showItemData;

    if (bindableFound) {
        showItemData = findDataItem.call(this, itemId, bindableFound, attribute);
    }

    if (showItemData) {
        $(item).removeClass('hidden');
        return;
    }

    $(item).addClass('hidden');
}

function setClassModel(attribute, item) {

    var $item = $(item);
    var classObject = attribute.replace(/'/gi, "\"");
    classObject = JSON.parse(classObject);

    Object.keys(classObject).forEach((key) => {
        if (classObject[key]) {
            $item.addClass(key);
        }
    });
}

function getItemData(item, attribute) {
    var result = {
        data: this.data,
        key: attribute
    };
    var bindableKey = attribute.split('.')[0];
    var bindableFound = Utils.find(this.bindables, {
        itemKey: bindableKey
    });
    var itemId = item.getAttribute('es-id');

    if (bindableFound) {
        result = findDataItem.call(this, itemId, bindableFound, attribute);
    }

    return result;
}

function initializeModel(attribute, item, onChange) {

    var inputType = item.getAttribute('type') || '';
    var changeEvent = inputs[inputType].change;
    var inputValue = inputs[inputType].value;

    $(item).on(changeEvent, Utils.curry(onChange, this, item, attribute, this.data));

    var result = getItemData.call(this, item, attribute) ;
    var data = result ? result.data : null;
    var key = result ? result.key : null;

    item[inputValue] = (data ? data[key] : null) || inputs[inputType].default;

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
function initializeModels(attr, item) {

    var attribute = item.getAttribute(attr);

    function onChange(component, item, attr, data) {

        var inputValue = inputs[item.getAttribute('type') || ''].value;
        var result = getItemData.call(component, item, attr);

        var splitedAttr = attr.split('.');
        splitedAttr = splitedAttr[splitedAttr.length - 1];

        result.data.update({
            [splitedAttr]: item[inputValue]
        });
    }

    switch(attr) {
        case 'es-show':
            setShowModel.call(this, attribute, item);
            break;

        case 'es-class':
            setClassModel.call(this, attribute, item);
            break;

        default:
            initializeModel.call(this, attribute, item, onChange);
    }

    this.models.set(attribute, item);
}

/**
 * @method
 * @private
 * @name initializeFunction
 * @param {Object} item - DOM element with the attribute es-click
 * @description
 * Given a element with es-click it will call the correspondant callback
 */
function initializeFunction(event, attribute, item) {

    function handler(component, evt) {
        var attr = this.getAttribute(attribute).split('(');
        var itemId = this.getAttribute('es-id');
        var fnName = attr[0];
        var tmp = attr[1].substring(0, attr[1].length - 1).split(',');
        var params = [];
        var dataItem;

        //TODO: evaluate parameters
        tmp.forEach((parameter) => {
            switch (parameter) {
                case '$evt':
                    params.push(evt);
                    break;
                default:
                    /**
                     * Check if can find "parameter" in "component.bindables[n].itemKey", if found then
                     * go to component.data[key]
                     */
                    var bindableKey = parameter.split('.')[0];
                    var bindableFound = Utils.find(component.bindables, {
                        itemKey: parameter
                    });

                    if (bindableFound) {

                        dataItem = findDataItem.call(component, itemId, bindableFound, parameter);
                        dataItem = dataItem ? dataItem.data : null;

                        if(dataItem) {
                            params.push(dataItem);
                        }

                    }
            }
        });

        component[fnName].apply(null, params);
    }

    $(item).on(event, Utils.curry(handler, this));
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
            case 'es-dblclick':
                initializeFunction.call(this, 'ondblclick', attribute.nodeName, item);
                break;

            case 'es-click':
                initializeFunction.call(this, 'click', attribute.nodeName, item);
                break;

            case 'es-keydown':
                initializeFunction.call(this, 'keydown', attribute.nodeName, item);
                break;

            case 'es-model':
            case 'es-show':
            case 'es-class':
                initializeModels.call(this, attribute.nodeName, item);
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

    Array.from(data).forEach((item) => {

        let rowData = {
            [bindable.itemKey]: item
        };

        Object.assign(rowData, this.data);

        var content = Interpolate.compile(bindable.template, rowData);
        content = content.replace('es-bindable="es-bindable"');
        content = content.replace(/es-item=\"es-item\"/g, 'es-item="es-item" es-id="'+item.$id+'"');

        bindable.element.innerHTML += content;
    });
}

function initializeRepeatBindables(repeats) {

    Array.from(repeats).forEach((repeat) => {

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

function initializeItemBindable(bindables) {
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

function initializeBindables() {

    var repeats = $(this.shadow).find('[es-repeat]');

    if (repeats && repeats.length) {
        initializeRepeatBindables.call(this, repeats);
    }

    var bindables = $(this.shadow).find('[es-bindable]');

    if (!bindables || !bindables.length) {
        return;
    }

    initializeItemBindable.call(this, bindables)
}

function bindChanges(self, change) {
    var bindables = [];

    self.bindables.forEach((bindable) => {

        let isInKeys = bindable.keys && bindable.keys.has(change.name);
        let isInBindableKey = bindable.key === change.name;

        if (isInKeys || isInBindableKey) {
            bindables.push(bindable);
        }
    });

    bindables.forEach((bindable) => {

        if (bindable.type == 'repeat') {
            renderRepeat.call(self, bindable);

            initializeBindables.call(self);
            initializeBindings.call(self);

            return;
        };

        bindable.element.innerHTML = Interpolate.compile(bindable.template, self.data);
    });
}

function observe() {
    var self = this;

    return function(changes) {
        changes.forEach((change) => {
            var model;

            bindChanges(self, change);

            model = self.models.get(change.name);
            if (model) {
                model.value = change.object ? change.object[change.name] : null;
            }
        });
    };
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

        let obj = fn(this);

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

        this.data.addFisherman({
            fn: observe.call(this)
        }, 'COMPONENT');

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
