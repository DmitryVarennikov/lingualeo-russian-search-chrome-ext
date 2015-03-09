'use strict';

require({
        baseUrl: '.',
        paths:   {
            text: "scripts/text"
        }
    },
    [
        'scripts/storage',
        'scripts/service',
        'scripts/view'
    ],
    function (Storage, Service, View) {
        console.log('background page running...');
    });
