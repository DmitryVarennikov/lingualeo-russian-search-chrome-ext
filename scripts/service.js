'use strict';

define([], function () {
    function Service() {
        if (! (this instanceof Service)) {
            throw new Error('`this` must be an instance of Service');
        }

        /**
         * @TODO: download only new words
         * Download words in batch
         * @param {Function} callback({String}, {Number}, {Array})
         */
        this.download = function (callback) {
            var downloadedWords = 0;

            downloadPartsRecursively(0, function (error, totalWords, wordsBatch) {
                var percentage;

                if (error) {
                    callback(error);
                } else {
                    downloadedWords += wordsBatch.length;
                    percentage = calcPercentage(totalWords, downloadedWords);
                    callback(null, percentage, wordsBatch);
                }
            });
        };

        function calcPercentage(totalWords, downloadedWords) {
            return Math.round(downloadedWords * 100 / totalWords);
        }

        function downloadPartsRecursively(page, callback) {
            var req = new XMLHttpRequest();
            req.open('GET', 'http://lingualeo.com/ru/userdict/json?page=' + page, true);
            req.onreadystatechange = function () {
                if (4 === req.readyState) {
                    if (200 === req.status) {
                        var words = [];
                        var response = JSON.parse(req.response);
                        if (response.error_msg) {
                            callback(response.error_msg);
                        } else {
                            response.userdict3.forEach(function (group) {
                                words = words.concat(group.words);
                            });

                            callback(null, response.count_words, words);

                            if (response.show_more) {
                                downloadPartsRecursively(++ page, callback);
                            }
                        }
                    }
                }
            };
            req.send(null);
        }


    }

    return Service;
});
