'use strict';

define([], function () {
    function Storage(service) {
        if (! (this instanceof Storage)) {
            throw new Error('`this` must be an instance of Storage');
        }

        // sync storage has limitations on 4KB per item and 100KB in total
        // local storage is 5MB but we explicitly requested "unlimitedStorage" in manifest
        var storage = chrome.storage.local,
            words = [];

        // pre load words as soon as we create an object (it basically means we hit http://lingualeo.com/ru/userdict)
        getWords(function (_words) {
            words = _words;

            var latestWord = null;
            if (words.length) {
                latestWord = words[0];
            }

            updateWords(latestWord);
        });


        /**
         * @param {String} term
         * @param {Function} callback({String})
         */
        this.search = function (term, callback) {
            // @TODO: interrupt search for an old term if a new one has come

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
        };

        function updateWords(latestWord) {
            service.downloadWords(latestWord, function (error, wordsBatch) {
                if (error) {
                    console.error(error);
                } else {
                    // !!!important: if we already have the latest word then add new batch on top of the the basis,
                    // otherwise merge down (it's an initial download)

                    if (latestWord) {
                        console.info("Latest word:", wordsBatch);
                        words = wordsBatch.concat(words);
                    } else {
                        words = words.concat(wordsBatch);
                    }


                    storage.set({"words": words}, function () {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                        }
                    });
                }
            });
        };

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
