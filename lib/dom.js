//http://www.ericponto.com/blog/2014/10/05/es6-dom-library/

/**
 * jQuery like DOM class
 * @class
 */
class DOM {
    /**
     * create a new array like object of elements
     * @constructor
     */
    constructor(arg) {
        let elements = [];

        if(typeof arg === 'string') {
            elements = document.querySelectorAll(arg);
        } else {
            elements.push(arg);
        }

        this.length = elements ? elements.length : 1;
        Object.assign(this, elements || arg);
    }

    /**
     * @param {Function} callback A callback to call on each element
     */
    each(callback) {
        // convert this to Array to use for...of
        for (let el of Array.from(this)) {
            callback.call(el);
        }

        // return this for chaining
        return this;
    }

    /**
     * Add a class to selected elements
     * @param {String} className The class name to add
     */
    addClass(className) {
        return this.each(function () {
            this.classList.add(className);
        });
    }

    toggleClass(className) {
        return this.each(function () {

            let element = $(this);

            if (element.hasClass(className)) {
                element.removeClass(className);
                return;
            }

            element.addClass(className);
        })
    }

    /**
     * Remove a class from selected elements
     * @param {String} className The class name to remove
     */
    removeClass(className) {
        return this.each(function () {
            this.classList.remove(className);
        });
    }

    /**
     * Check to see if the element has a class
     * (Note: Only checks the first elements if more than one is selected)
     * @param {String} className The class name to check
     */
    hasClass(className) {
        return this[0].classList.contains(className);
    }

    find(selector) {

        return this[0].querySelectorAll(selector);
    }

    /**
     * Attach an event listener with a callback to the selected elements
     * @param {String} event Name of event, eg. "click", "mouseover", etc...
     * @param {Function} callback The function to call when the event is triggered
     */
    on(event, callback) {
        return this.each(function () {
            this.addEventListener(event, callback, false);
        });
    }
};

export var $ = selector => new DOM(selector);
