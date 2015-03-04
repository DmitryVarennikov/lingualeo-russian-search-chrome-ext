'use strict';

require(
    {
        baseUrl: chrome.extension.getURL("/"),
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
        var service = new Service(),
            storage = new Storage(service),
            view = new View(storage, service);

        view.listenToSearchBox();
    }
);


