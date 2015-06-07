import {Component} from './component';
import {Provider} from './provider';

function loadImport (path, resolve, reject) {
    var link = document.createElement('link');

    function handleLoad(e) {
        console.log('Loaded import: ' + e.target.href);
        resolve(link);
    }
    function handleError(e) {
        console.log('Error loading import: ' + e.target.href);
        reject();
    }

    link.rel = 'import';
    link.href = path;
    link.onload = handleLoad;
    link.onerror = handleError;
    document.head.appendChild(link);
}


class Truta {
    constructor() {
        this.components = new Map();
        this.providers = new Map();
    }

    bootstrap (urls) {

        var promises = [];

        urls.forEach(function (url) {
            promises.push(new Promise(function (resolve, reject) {
                loadImport(url, resolve, reject)
            }))
        });

        return Promise.all(promises);
    }

    component(name, data) {
        this.components.set(name, data);
        return this;
    }

    provider(name, fn) {
        this.providers.set(name, new Provider(fn));
        return this;
    }

    getProviderByName(name) {
        return this.providers.get(name);
    }

    createComponentInstance(name) {
        return new Component(this.components.get(name));
    }
}

let trutaInstance = new Truta();
export default trutaInstance;
