import {$} from './lib/dom';
import Store from './lib/store';
import Router from './lib/router';
import Container from './lib/container';
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

    Container.register('profile-form', {
        element: 'profile-form',
        scope: data,
        methods: {
            teste: (component) => {
                component.data.value.name = 'agaaggaga';
            }
        }
    });

    Router.state('', {
        content: {
            component: 'profile-form'
        },
        hello: {
            component: 'profile-form'
        }
    });

    Router.start();
}
