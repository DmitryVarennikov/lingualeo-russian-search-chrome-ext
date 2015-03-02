'use strict';

define([], function () {
    function Storage(service) {
        if (! (this instanceof Storage)) {
            throw new Error('`this` must be an instance of Storage');
        }

        // sync storage has limitations on 4KB per item and 100KB in total
        var storage = chrome.storage.local,
            words = [];

        // pre load words as soon as we create an object (it basically means we hit http://lingualeo.com/ru/userdict)
        getWords(function (_words) {
            words = _words;
        });


        /**
         * @param {String} term
         * @param {Function} callback({String})
         */
        this.search = function (term, callback) {
            // just in case
            if (words.length) {
                search(words, term, callback);
            } else {
                getWords(function (_words) {
                    words = _words;
                    search(words, term, callback);
                });
            }

            // @TODO: interrupt search for an old term if a new one has come
            function search(words, term, callback) {
                var prevWordValue,
                    resultNum = 0;

                words.forEach(function (word) {
                    if (resultNum < 20) {
                        word.user_translates.forEach(function (translation) {
                            if (translation.translate_value.indexOf(term) > - 1) {


                                if (prevWordValue != word.word_value) {
                                    prevWordValue = word.word_value;
                                    resultNum ++;

                                    callback(word);
                                }
                            }
                        });
                    }
                });
            }
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
