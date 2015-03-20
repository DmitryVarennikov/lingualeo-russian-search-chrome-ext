'use strict';

function GoogleAnalytics() {
    if (! (this instanceof GoogleAnalytics)) {
        throw new Error('`this` must be an instance of `GoogleAnalytics`');
    }

    _gaq.push(['_setAccount', 'UA-61000540-1']);

    this.trackPageview = function () {
        _gaq.push(['_trackPageview']);
    };

    this.trackEvent = function (name, value) {
        _gaq.push(['_trackEvent', name, value]);
    };
}


define(['google-analytics'], function (_) {

    var ga;

    return {
        getInstance: function () {
            if (! (ga instanceof GoogleAnalytics)) {
                ga = new GoogleAnalytics();
            }

            return ga;
        }
    };

});
