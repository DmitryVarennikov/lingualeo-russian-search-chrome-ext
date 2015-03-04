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
        'scripts/view',
        'text!templates/dict-row.tpl'
    ],
    function (Storage, Service, View, dictRowTpl) {
        console.log('background page running...');
        console.log(dictRowTpl);
    });
