import {$} from './lib/dom';
import {Store} from './lib/store';
import {Component} from './lib/component';

function loadImports (path, resolve, reject) {
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

var promise = new Promise(function (resolve, reject) {
    loadImports('/views/components/profile-form/index.html', resolve, reject)
});

promise.then(init);


function init (link) {

    var data = {
        name: 'teste',
        last_name: 'teste'
    };

    var component = new Component({
        host: '.container',
        element: 'profile-form',
        scope: data,
        methods: {
            teste: (component) => {
                component.data.value.name = 'agaaggaga';
            }
        }
    });

    var store = new Store();
    window.setTimeout(function () {
        store.get(component.key).value.name = 'coisas';
    }, 1000);
}
