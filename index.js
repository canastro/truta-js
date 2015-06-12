import { $, Data, Store, Router, Truta, Http } from './lib/index';

Truta.bootstrap([
    '/views/components/profile-form/index.html',
    '/views/components/header/index.html'
]).then(function () {

    Truta
        .component('profile-form', function (ProfileForm) {

            let data = {
                name: 'teste',
                last_name: 'teste',
                items: [
                    {text: '1'},
                    {text: '2'}
                ]
            };

            let AuthProvider = Truta.getProviderByName('auth');

            ProfileForm.teste = function () {
                //ProfileForm.data.value.name = 'aahahaha';
                //AuthProvider.teste();

                ProfileForm.data.value.items =  [
                    {text: '3'},
                    {text: '4'}
                ];
            };

            return {
                element: 'profile-form',
                data: data
            };
        })
        .component('truta-header', function (TrutaHeader) {

            let data = {
                title: 'Cenas'
            };

            return {
                element: 'truta-header',
                data: data
            };
        })
        .provider('auth', function (AuthProvider) {



            AuthProvider.teste = function () {
                // var url =
                // Http.post(url, {
                //     email: "user@test.com",
                //     password: "password"
                // }).then(function(response) {
                //     console.log(response);
                // });
                alert(1);
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
