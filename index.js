import { $, Store, Router, Truta } from './lib/index';

Truta.bootstrap([
    '/views/components/profile-form/index.html',
    '/views/components/header/index.html'
]).then(function () {

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
});
