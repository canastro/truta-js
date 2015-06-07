import { $, Store, Router, Truta } from './lib/index';

Truta.bootstrap([
    '/views/components/profile-form/index.html',
    '/views/components/header/index.html'
]).then(function () {

    Truta
        .component('profile-form', function (ProfileForm) {
            let data = {
                name: 'teste',
                last_name: 'teste'
            };

            let teste = () => {
                ProfileForm.data.value.name = 'aahahaha';
            };

            return {
                element: 'profile-form',
                data: data,
                methods: {
                    teste
                }
            };
        })
        .component('truta-header', function () {
            let data = {
                title: 'Cenas'
            };

            return {
                element: 'truta-header',
                data: data
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
