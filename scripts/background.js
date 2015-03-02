'use strict';

require.config({
    baseUrl: '.'
});

require([
        'scripts/storage',
        'scripts/service',
        'scripts/view'
    ],
    function (Storage, Service, View) {
        console.log('background page running...');
    });
