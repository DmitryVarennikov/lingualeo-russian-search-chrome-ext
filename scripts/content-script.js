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

        // as soon as we hit lingualeo dictionary update the latest words and listen to the search box
        storage.updateWords();
        view.listenToSearchBox();
    }
);


