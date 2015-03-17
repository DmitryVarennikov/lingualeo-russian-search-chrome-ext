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

        function sync() {
            service.isAuthenticated(function (error, is) {
                if (error) {
                    console.error(error);
                } else if (is) {
                    storage.sync();
                    storage.setLastSyncDate(Date.now());
                }
            });
        }

        document.getElementsByName('sync')[0].addEventListener('click', function () {
            sync();
        });


        // run synchronization every 24 hours, check every hour
        setInterval(function () {
            storage.getLastSyncDate(function (lastSyncDate) {
                var date;
                if (lastSyncDate) {
                    date = new Date(lastSyncDate);
                    date.setHours(date.getHours() + 24);
                    if (date < new Date()) {
                        sync();
                    }
                } else {
                    sync();
                }
            });
        }, 1000 * 60 * 60);


    });
