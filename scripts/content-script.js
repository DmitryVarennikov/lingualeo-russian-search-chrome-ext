'use strict';

require(
    {baseUrl: chrome.extension.getURL("/")},
    [
        'scripts/storage',
        'scripts/service',
        'scripts/view'
    ],
    function (Storage, Service, View) {
        var service = new Service(),
            storage = new Storage(service),
            view = new View(storage);

        view.listenToSearchBox();
    }
);


