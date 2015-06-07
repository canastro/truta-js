import { $, Store, Router, Truta } from './lib/index';

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
        .component('profile-form', function () {
            let scope = {
                name: 'teste',
                last_name: 'teste'
            };

            let teste = () => {
                this.data.value.name = 'aahahaha';
            };

            return {
                element: 'profile-form',
                scope: scope,
                methods: {
                    teste
                }
            };
        })
        .component('truta-header', function () {
            let scope = {
                title: 'Cenas'
            };

            let teste = () => {
                this.data.value.name = 'aahahaha';
            };

            return {
                element: 'truta-header',
                scope: scope,
                methods: {
                    teste
                }
            };
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
            header: {
                component: 'truta-header'
            },
            content: {
                component: 'profile-form'
            },
            hello: {
                component: 'profile-form'
            }
        });

    Router.start();

    document.querySelector('.check-store').addEventListener('click', function checkStore () {
        debugger;
        console.log(Store);
    }, false);
}
