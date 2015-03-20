'use strict';

require(
    {
        baseUrl: chrome.extension.getURL("/"),
        paths:   {
            "google-analytics": [
                'https://ssl.google-analytics.com/ga'
            ]
        }
    },
    [
        'scripts/google-analytics',
        'scripts/service',
        'scripts/storage'
    ],
    function (GoogleAnalytics, Service, Storage) {
        var ga = GoogleAnalytics.getInstance(),
            service = new Service(),
            storage = new Storage(service);

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if ("trackPageview" === request.ga) {
                ga.trackPageview();
            }
        });

        function sync() {
            service.isAuthenticated(function (error, is) {
                if (error) {
                    console.error(error);
                    ga.trackEvent('sync', 'user authentication check error');
                } else if (is) {
                    storage.sync();
                    storage.setLastSyncDate(Date.now());

                    ga.trackEvent('sync', 'user is authenticated');
                } else {
                    ga.trackEvent('sync', 'user is not authenticated');
                }
            });
        }

        document.getElementsByName('sync')[0].addEventListener('click', function () {
            ga.trackEvent('sync', 'button-clicked');

            sync();
        });


        // run synchronization every 24 hours, check every hour
        setInterval(function () {
            ga.trackEvent('sync', 'check');

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
