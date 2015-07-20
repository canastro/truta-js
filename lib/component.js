import {
    $
}
from "./dom";
import Interpolate from "./interpolate";
import * as Utils from "./utils";
import {Shoal} from "./data/shoal";

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

/**
 * @method
 * @name findDataItem
 * @param {String} itemId
 * @param {String} key
 * @param {String} attribute
 * @description
 * Given a key find object in the this.data
 */
function findDataItem(itemId, key, attribute) {

    var dataItem;

    // If its not a shoal (array) then we can get the item by calling
    // getDataByKey
    if (!(this.data[key] instanceof Shoal)) {
        return Utils.getDataByKey(this.data, key);
    }

    // If its a shaol, iterate all items find the one with the correct
    // $id and get the correct dataItem
    dataItem = Utils.find(this.data[key], {
        $id: itemId
    });

    return dataItem ? Utils.getDataByKey(dataItem, attribute) : null;
}

function findKey(key) {

    let result;

    result = Utils.find(this.keys, {
        key: key
    });

    if (!result) {
        return null;
    }

    return result.repeatKey || result.key;
}

//TODO: REFACTORING NEEDED, this needs to handle operations, just like
// what we have in the calculateClassBindable
/**
 * @method
 * @name setShowModel
 * @param {String} attribute
 * @param {Object} item
 * @description
 * handle es-show attributes, this will toggle the class 'hidden'
 */
function setShowModel(attribute, item) {
    var itemId = item.getAttribute('es-id');
    var bindableKey = attribute.split('.')[0];
    var found = false;
    var showItemData;
    var key = findKey.call(this, bindableKey);
    key = key || bindableKey;

    showItemData = findDataItem.call(this, itemId, key, attribute);

    if (showItemData && showItemData.data && showItemData.data[showItemData.key]) {
        $(item).removeClass('hidden');
        return;
    }

    $(item).addClass('hidden');
}

/**
 * @method
 * @name calculateClassBindable
 * @param {Object} bindable
 * @description
 * handle es-class attributes
 */
function calculateClassBindable(bindable) {
    var data;
    var result;
    var $item = $(bindable.item);
    var itemId = bindable.item.getAttribute('es-id');
    var keyArray = bindable.operation.split(' ')[0].split('.');
    var template = '${' +bindable.operation + '}';
    var itemValue;

    //find key
    var key = findKey.call(this, bindable.key);
    key = key || bindable.key;

    itemValue = findDataItem.call(this, itemId, key, bindable.operation);

    if (keyArray.length === 1) {
        data = itemValue.data;
    } else {
        //TODO: this can have more then one level need to create this
        // with a recursive function
        data = {
            [bindable.key]: itemValue.data
        }
    }

    //Evaluate operation
    result = Interpolate.compile(template, data);

    if (result === "true") {
        $item.addClass(bindable.cssClass);
    } else {
        $item.removeClass(bindable.cssClass);
    }
}

/**
 * @method
 * @name initializeClassModel
 * @param {String} attribute
 * @param {Object} item
 * @description
 * Initialize all es-class attributes; generate all the bindables
 */
function initializeClassModel(attribute, item) {

    let bindable;
    let re = /'(\w*)':\s*(([\w= '"](\.)*)*)[,}]?/gi;
    let m;

    while ((m = re.exec(attribute)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        bindable = {};
        bindable.cssClass = m[1];
        bindable.operation = m[2];
        bindable.key = m[2].split(' ')[0].split('.')[0];
        bindable.item = item;
        bindable.type = 'css-class';
        this.bindables.push(bindable);

        calculateClassBindable.call(this, bindable);
    }
}

/**
 * @method
 * @name getItemData
 * @param {String} attribute
 * @param {Object} item
 * @description
 * Based on item (itemId) and attribute get value from this.data
 */
function getItemData(item, attribute) {
    var result = {
        data: this.data,
        key: attribute
    };
    var itemId = item.getAttribute('es-id');

    //Find key
    var lookupKey = attribute.split('.')[0];
    var key = findKey.call(this, lookupKey);

    if (key) {
        result = findDataItem.call(this, itemId, key, attribute);
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
            initializeClassModel.call(this, attribute, item);
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

            let bindableKey;
            let key;

            if (parameter[0] === "'" && parameter[parameter.length - 1] === "'") {
                params.push(parameter.substr(1, parameter.length - 2));
            }

            switch (parameter) {
                case '$evt':
                    params.push(evt);
                    break;
                default:
                    /**
                     * Check if can find "parameter" in "component.bindables[n].itemKey", if found then
                     * go to component.data[key]
                     */
                    bindableKey = parameter.split('.')[0];
                    key = findKey.call(component, bindableKey);
                    key = key || bindableKey;

                    dataItem = findDataItem.call(component, itemId, key, parameter);
                    dataItem = dataItem ? dataItem.data : null;

                    if(dataItem) {
                        params.push(dataItem);
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

        this.keys.add({
            type: 'repeat',
            repeatKey: dataItem,
            key: dataItemKey
        });
        this.bindables.push(bindable);
    });
}

function initializeItemBindable(bindables) {

    Array.from(bindables).forEach((item) => {
        let content;
        let bindable = {};
        bindable.type = 'simple';
        bindable.element = item;
        bindable.template = item.innerHTML;
        bindable.keys = getAllBindableKeys(item.innerHTML);

        content = Interpolate.compile(bindable.template, this.data);
        content = content.replace('es-bindable="es-bindable"', '');

        bindable.element.innerHTML = content;

        Array.from(bindable.keys).forEach((key) => {
            this.keys.add({
                type: 'simple',
                key: key
            });
        });

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

        if (bindable.type === 'repeat') {
            renderRepeat.call(self, bindable);

            initializeBindables.call(self);
            initializeBindings.call(self);

            return;
        }

        if (bindable.type === 'css-class') {
            calculateClassBindable.call(self, bindable);
            return;
        }

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
        this.keys = new Set();

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
