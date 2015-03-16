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


        /**
         * @param {String} term
         * @param {Number} groupId
         * @param {Function} callback({String}, {String})
         */
        this.search = function (term, groupId, callback) {
            var prevWordValue,
                resultNum = 0;

            words.forEach(function (word) {
                if (resultNum < 20) {

                    if (groupId) {
                        if (word.groups && word.groups.indexOf(groupId) > - 1) {
                            searchTranslations(word, word.user_translates);
                        }
                    } else {
                        searchTranslations(word, word.user_translates);
                    }
                }
            });

            function searchTranslations(word, translations) {
                translations.forEach(function (translation) {
                    if (translation.translate_value.indexOf(term) > - 1) {

                        if (prevWordValue != word.word_value) {
                            prevWordValue = word.word_value;
                            resultNum ++;

                            callback(word, term);
                        }
                    }
                });
            }
        };

        this.sync = function () {
            var that = this;

            storage.remove('words', function () {
                words = [];
                that.updateWords();
            });
        };

        this.updateWords = function () {
            var latestWord = null,
                nonEmptyBatchWasPresented = false;

            function downloadWordsRecursivelyCallback(error, wordsBatch, isThereMoreWords) {
                if (error) {
                    console.error(error);

                    // save all grabbed words so far
                    setWords(words);
                } else {
                    if (wordsBatch.length) {
                        nonEmptyBatchWasPresented = true;
                    }

                    // !!!important: if we already have the latest word then add new batch on top of the basis,
                    // otherwise merge down (it's an initial download)

                    if (latestWord) {
                        console.info("Latest word:", latestWord.word_value);
                        words = wordsBatch.concat(words);
                    } else {
                        words = words.concat(wordsBatch);
                    }

                    // save only one time at the very end
                    console.info('is there more words:', isThereMoreWords);
                    // no need to re-save pre-loaded words if there was no new ones
                    if (! isThereMoreWords && nonEmptyBatchWasPresented) {
                        console.info('re-saving words...');
                        setWords(words);
                    }
                }
            }

            if (words.length) {
                latestWord = words[0];
                service.downloadWordsRecursively(latestWord, downloadWordsRecursivelyCallback);
            } else {
                // pre-load existing words into memory if there are none
                getWords(function (_words) {
                    words = _words;

                    if (words.length) {
                        latestWord = words[0];
                    }

                    service.downloadWordsRecursively(latestWord, downloadWordsRecursivelyCallback);
                });
            }
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

        function setWords(words) {
            storage.set({"words": words}, function () {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                }
            });
        }
    }

    return Storage;
});
