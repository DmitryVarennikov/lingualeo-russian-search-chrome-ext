'use strict';

define([], function () {
    function Storage(service) {
        if (! (this instanceof Storage)) {
            throw new Error('`this` must be an instance of Storage');
        }

        // sync storage has limitations on 4KB per item and 100KB in total
        var storage = chrome.storage.local;


        /**
         * @param {String} term
         * @param {Function} callback({String})
         */
        this.search = function (term, callback) {
            getWords(function (words) {
                var prevWord;

                words.forEach(function (word) {
                    word.user_translates.forEach(function (translation) {
                        if (translation.translate_value.indexOf(term) > - 1) {
                            if (prevWord !== word) {
                                prevWord = word;
                                callback(word);
                            }
                        }
                    });
                });
            });
        };

        /**
         * Sync user words
         * @param {Function} callback({String}, {Number})
         */
        this.sync = function (callback) {
            getWords(function (words) {
                // @TODO: update words (e.i. add new words)
                if (words.length) {
                    callback(null, 100);
                } else {
                    service.download(function (error, percentage, wordsBatch) {
                        if (error) {
                            callback(error);
                        } else {
                            words = words.concat(wordsBatch);
                            console.log('words:', words);
                            storage.set({"words": words}, function () {
                                if (chrome.runtime.lastError) {
                                    console.error(chrome.runtime.lastError);
                                }

                                callback(null, percentage);
                            });
                        }
                    });
                }
            });
        }

        function getWords(callback) {
            var words = [];
            storage.get("words", function (obj) {
                if (obj.words) {
                    words = obj.words;
                }

                callback(words);
            });
        }
    }

    return Storage;
});
