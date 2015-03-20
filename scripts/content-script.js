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

        // as soon as we hit LinguaLeo dictionary/glossary update the latest words and listen to the search box
        storage.updateWords();
        view.listenToSearchBox();


        // because content script runs in the context of a web page we can not use Google Analytics here directly
        // let's communicate with bg page via messaging queue
        chrome.runtime.sendMessage({ga: "trackPageview"}, function (response) {
            // no feed back, though we don't need it
        });
    }
);


