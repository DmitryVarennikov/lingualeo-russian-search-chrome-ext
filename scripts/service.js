'use strict';

define([], function () {
    function Service() {
        if (! (this instanceof Service)) {
            throw new Error('`this` must be an instance of Service');
        }

        /**
         * @param {Function} callback({String|null}, {Array})
         */
        this.getGroups = function (callback) {
            var req = new XMLHttpRequest();
            req.open('GET', 'http://lingualeo.com/ru/userdict3/getWordSets', true);
            req.onreadystatechange = function () {
                if (4 === req.readyState && 200 === req.status) {
                    try {
                        var response = JSON.parse(req.response);
                        if (response.error_msg) {
                            callback(response.error_msg);
                        } else {
                            callback(null, response.result);
                        }
                    } catch (error) {
                        callback(error);
                    }

                }
            };
            req.send(null);
        };

        /**
         * @param {String|null} latestWord
         * @param {Function} callback({String|null}, {Array})
         */
        this.downloadWords = function (latestWord, callback) {
            downloadPartsRecursively(1, function (error, totalWords, wordsBatch) {
                var abort = false;

                if (error) {
                    callback(error);
                } else {
                    var newBatch = [];

                    if (latestWord) {
                        // grab all the words before the latest one
                        for (var i = 0, word; i < wordsBatch.length; i ++) {
                            word = wordsBatch[i];

                            if (word.word_id == latestWord.word_id) {
                                abort = true;
                                break;
                            } else {
                                newBatch.push(word);
                            }
                        }

                        callback(null, newBatch);
                    } else {
                        callback(null, wordsBatch);
                    }
                }

                // interrupt recursive dictionary download
                return abort;
            });
        };

        function calcPercentage(totalWords, downloadedWords) {
            return Math.round(downloadedWords * 100 / totalWords);
        }

        function downloadPartsRecursively(page, callback) {
            var req = new XMLHttpRequest();
            req.open('GET', 'http://lingualeo.com/ru/userdict/json?page=' + page, true);
            req.onreadystatechange = function () {
                if (4 === req.readyState && 200 === req.status) {
                    try {
                        var response = JSON.parse(req.response),
                            words = [];

                        if (response.error_msg) {
                            callback(response.error_msg);
                        } else {
                            response.userdict3.forEach(function (group) {
                                words = words.concat(group.words);
                            });

                            var abort = callback(null, response.count_words, words);

                            if (! abort && response.show_more) {
                                downloadPartsRecursively(++ page, callback);
                            }
                        }
                    } catch (error) {
                        callback(error);
                    }
                }
            };
            req.send(null);
        }


    }

    return Service;
});
