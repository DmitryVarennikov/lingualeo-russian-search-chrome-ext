'use strict';

define([], function () {
    function Service() {
        if (! (this instanceof Service)) {
            throw new Error('`this` must be an instance of Service');
        }

        var req = new XMLHttpRequest();

        /**
         * @param {Function} callback({String|null}, {Boolean})
         */
        this.isAuthenticated = function (callback) {
            req.open('GET', 'https://api.lingualeo.com/isauthorized', true);
            req.onreadystatechange = function () {
                if (4 === req.readyState && 200 === req.status) {
                    try {
                        var response = JSON.parse(req.response);
                        if (response.error_msg) {
                            callback(response.error_msg);
                        } else {
                            callback(null, response.is_authorized);
                        }
                    } catch (error) {
                        callback(error);
                    }

                }
            };
            req.send(null);
        };

        /**
         * @param {Function} callback({String|null}, {Array})
         */
        this.getGroups = function (callback) {
            req.open('GET', 'https://lingualeo.com/ru/userdict3/getWordSets', true);
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
         * Callback is called on every words batch. The last parameter tells if there is more words left
         * or that was the last batch.
         *
         * @param {Object|null} latestWord
         * @param {Function} callback({String|null}, {Array}, {Boolean})
         */
        this.downloadWordsRecursively = function (latestWord, callback) {
            downloadPartsRecursively(1, function (error, wordsBatch, isThereMoreWords) {
                var abort = false;

                if (error) {
                    callback(error);
                } else {
                    if (latestWord) {
                        var newBatch = [];

                        // grab all the words before the latest one
                        for (var i = 0, word; i < wordsBatch.length; i ++) {
                            word = wordsBatch[i];

                            if (word.word_id == latestWord.word_id) {
                                abort = true;
                                // if the latest word is found in a batch no need to go farther, notify caller about
                                // the end
                                isThereMoreWords = false;
                                break;
                            } else {
                                newBatch.push(word);
                            }
                        }

                        callback(null, newBatch, isThereMoreWords);
                    } else {
                        callback(null, wordsBatch, isThereMoreWords);
                    }
                }

                // interrupt recursive dictionary download if the latest word was found in a batch
                return abort;
            });
        };

        function downloadPartsRecursively(page, callback) {
            console.info('Downloading page', page);

            req.open('GET', 'https://lingualeo.com/ru/userdict/json?page=' + page, true);
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

                            var abort = callback(null, words, response.show_more);

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
