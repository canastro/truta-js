import {$} from './lib/dom';
import Store from './lib/store';
import Router from './lib/router';
import Truta from './lib/truta';
import {Component} from './lib/component';

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

var urls = [
    '/views/components/profile-form/index.html',
    '/views/components/header/index.html'
];

var promises = [];

urls.forEach(function (url) {
    promises.push(new Promise(function (resolve, reject) {
        loadImport(url, resolve, reject)
    }))
});

Promise.all(promises).then(init);


// promise.then(init);


function init (link) {

    var data = {
        name: 'teste',
        last_name: 'teste'
    };

    Truta
        .component('profile-form', {
            element: 'profile-form',
            scope: data,
            methods: {
                teste: (component) => {
                    component.data.value.name = 'agaaggaga';
                }
            }
        })
        .component('truta-header', {
            element: 'truta-header',
            scope: {
                title: 'Titulo'
            },
            methods: {
                teste: (component) => {
                    component.data.value.name = 'agaaggaga';
                }
            }
        })
        .provider('auth', function () {

        });

    Router
        .state('', {
            header: {
                component: 'truta-header'
            },
            content: {
                component: 'profile-form'
            }
        })
        .state('teste', {
            content: {
                component: 'profile-form'
            },
            hello: {
                component: 'profile-form'
            }
        });

    Router.start();
}
