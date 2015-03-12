'use strict';

define([
    'text!templates/dict-row.tpl'
], function (dictRowTpl) {

    function View(storage, service) {
        if (! (this instanceof View)) {
            throw new Error('`this` must be an instance of View');
        }

        // DOM elements
        var contentEl = document.getElementById('content'),
            searchResultsEl = contentEl.getElementsByClassName('dict-content')[0].children[0],
            notFoundEl = contentEl.getElementsByClassName('not-found')[0],
            notFoundImageEl = contentEl.getElementsByClassName('not-found-image')[0],
            searchBox = document.getElementsByName('search')[0],
            clearSearchBox = contentEl.getElementsByClassName('clear-search')[0];
        //var progressEl = document.getElementById('progress').children[0];


        // load groups meanwhile
        var groups = [];
        service.getGroups(function (error, _groups) {
            if (error) {
                console.error(error);
            } else {
                groups = _groups;
            }
        });


        function addClass(domEl, className) {
            if (! hasClass(domEl, className)) {
                domEl.className += " " + className;
            }
        }

        function removeClass(domEl, className) {
            var re = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');
            domEl.className = domEl.className.replace(re, '');
        }

        function hasClass(domEl, className) {
            var re = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
            return domEl.className.match(re);
        }

        function cleanTranslations() {
            var children = searchResultsEl.children;

            var i = children.length - 1,
                child;
            while (i >= 0) {
                child = children[i];

                if (hasClass(child, 'translation')) {
                    searchResultsEl.removeChild(child);
                }

                i --;
            }
        }

        var prevSearchTerm,
            wordNumber;

        function updateSearchResults(word, searchTerm) {
            var translations = [];

            if (prevSearchTerm != searchTerm) {
                wordNumber = 1;
                prevSearchTerm = searchTerm;
            } else {
                wordNumber ++;
            }

            word.user_translates.forEach(function (translation) {
                translations.push(translation.translate_value);
            });

            var wrapperEl = document.createElement('div');
            wrapperEl.setAttribute('class', 'dict-item-word translation');
            wrapperEl.dataset.wordId = word.word_id;
            wrapperEl.dataset.card = word.word_id;
            wrapperEl.dataset.wordValue = word.word_value;
            wrapperEl.dataset.wordNumber = wordNumber;
            wrapperEl.innerHTML = dictRowTpl;

            var deleteWrdEl = wrapperEl.getElementsByClassName('item-word-delete')[0];
            deleteWrdEl.dataset.removeWord = word.word_id;

            if (word.picture_url) {
                var imageEl = wrapperEl.getElementsByClassName('pic-bl__img')[0];
                imageEl.src = word.picture_url;
            }

            var progressEl = wrapperEl.getElementsByClassName('item-word-progress')[0];
            progressEl.className += ' item-word-progress-' + word.progress_percent;
            progressEl.dataset.progressPercent = word.progress_percent;
            progressEl.dataset.tooltip = "Word progress: " + word.progress_percent + "%.";
            progressEl.dataset.showChangeProgress = word.word_id;


            var soundEl = wrapperEl.getElementsByClassName('item-word-sound')[0];
            soundEl.dataset.voiceUrl = word.sound_url;
            soundEl.dataset.tooltip = word.transcription;

            var groupsEl = wrapperEl.getElementsByClassName('kits-name')[0];
            if (word.groups) {
                var groupsAdded = 0;
                word.groups.forEach(function (wordGroup) {
                    var groupLinkEl = document.createElement('a');
                    groupLinkEl.setAttribute('class', 't-ellps link-gray-dotted');
                    groupLinkEl.dataset.wordGroup = wordGroup;
                    // @TODO: owner?
                    groupLinkEl.dataset.wordGroupType = "owner";

                    groupLinkEl.innerText = "nameless";
                    groups.forEach(function (group) {
                        if (group.id == wordGroup) {
                            groupLinkEl.innerText = group.name;
                        }
                    });

                    // separate group names from each other
                    if (groupsAdded) {
                        var groupsSeparatorEl = document.createElement('span');
                        groupsSeparatorEl.innerText = ", ";
                        groupsEl.appendChild(groupsSeparatorEl);
                    }

                    groupsEl.appendChild(groupLinkEl);
                    groupsAdded ++;
                });
            }

            var wordEl = wrapperEl.getElementsByClassName('item-word-translate')[0].getElementsByTagName('b')[0];
            wordEl.innerText = word.word_value;

            var translationsEl = wrapperEl.getElementsByClassName('translates t-ellps')[0];
            translationsEl.innerText = translations.join('; ');


            searchResultsEl.appendChild(wrapperEl);
        }

        this.listenToSearchBox = function () {
            clearSearchBox.addEventListener('click', function (e) {
                if (hasClass(searchResultsEl, 'translations')) {
                    removeClass(searchResultsEl, 'translations');
                    cleanTranslations();
                }
            });

            searchBox.addEventListener('keyup', function (e) {
                if (this.value) {
                    removeClass(clearSearchBox, 'vhidden');
                }

                if (hasClass(searchResultsEl, 'translations')) {
                    removeClass(searchResultsEl, 'translations');
                    cleanTranslations();

                    if (! this.value) {
                        // trigger lingualeo dictionary results
                        clearSearchBox.click();
                    }
                }


                if (this.value && isCyrillicInput(this.value)) {
                    var groupId = null;

                    if (location.pathname.indexOf('/ru/userdict/wordSets/') > - 1) {
                        groupId = location.pathname.replace('/ru/userdict/wordSets/', '');
                        // just in case there is a garbage after group id in the URL
                        var slashPos = groupId.indexOf('/');
                        if (slashPos > - 1) {
                            groupId = groupId.substring(0, groupId.indexOf('/'));
                        }
                        groupId = Number(groupId);
                    }

                    e.stopPropagation();

                    addClass(searchResultsEl, 'translations');
                    searchResultsEl.style.display = "block";
                    searchResultsEl.innerHTML = "";

                    storage.search(this.value, groupId, updateSearchResults);
                }
            });
        };

        /**
         * Actually everything that we need to know is if the first character matches russian alphabet
         *
         * @param {String} input
         * @returns {boolean}
         */
        function isCyrillicInput(input) {
            if (input) {
                return null !== input[0].match(/[а-я]+/ig);
            } else {
                return false;
            }
        }
    }

    return View;
});
