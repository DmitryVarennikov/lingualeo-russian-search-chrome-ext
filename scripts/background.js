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
        var service = new Service(),
            storage = new Storage(service),
            view = new View(storage);

        storage.sync(function (error, percentage) {
            if (error) {
                console.error(error);
            } else {
                view.updateProgressBar(percentage);
            }
        });
    });
