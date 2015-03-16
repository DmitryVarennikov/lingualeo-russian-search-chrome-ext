'use strict';

require(
    {
        baseUrl: chrome.extension.getURL("/")
    },
    [
        'scripts/service',
        'scripts/storage'
    ],
    function (Service, Storage) {
        var service = new Service(),
            storage = new Storage(service);

        document.getElementsByName('sync')[0].addEventListener('click', function () {
            sync();
        });

        // run synchronization every 24 hours
        setInterval(function () {
            sync();
        }, 1000 * 60 * 60 * 24);

        function sync() {
            service.isAuthenticated(function (error, is) {
                if (error) {
                    console.error(error);
                } else if (is) {
                    storage.sync();
                }
            });
        }
    });
