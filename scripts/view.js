'use strict';

define([], function () {
    function View(storage, service) {
        if (! (this instanceof View)) {
            throw new Error('`this` must be an instance of View');
        }

        // DOM elements
        var contentEl = document.getElementById('content'),
            searchResultsEl = contentEl.getElementsByClassName('dict-short-view')[0],
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


        function updateSearchResults(word) {
            var translations = [];
            word.user_translates.forEach(function (translation) {
                translations.push(translation.translate_value);
            });

            var soundEl = document.createElement('div');
            soundEl.setAttribute('class', 'item-word-sound');
            soundEl.dataset.voiceUrl = word.sound_url;
            soundEl.dataset.tooltip = word.transcription;

            var groupsEl = document.createElement('div');
            groupsEl.setAttribute('class', 'kits-name');
            groupsEl.dataset.widget = "WordGroupTagsContainer";

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


            var wordWrapperEl = document.createElement('div');
            wordWrapperEl.setAttribute('class', 'item-word-translate');

            var wordEl = document.createElement('b');
            wordEl.innerText = word.word_value;

            var separatorEl = document.createElement('span');
            separatorEl.innerHTML = "&nbsp;—&nbsp;";

            var translationsEl = document.createElement('span');
            translationsEl.setAttribute('class', 'translates t-ellps');
            translationsEl.dataset.widget = "DictionaryTranslates";
            translationsEl.innerText = translations.join('; ');

            wordWrapperEl.appendChild(wordEl);
            wordWrapperEl.appendChild(separatorEl);
            wordWrapperEl.appendChild(translationsEl);


            var wrapperEl = document.createElement('div');
            wrapperEl.setAttribute('class', 'dict-item-word translation');
            wrapperEl.dataset.wordId = word.word_id;
            wrapperEl.dataset.card = word.word_id;


            wrapperEl.appendChild(soundEl);
            wrapperEl.appendChild(groupsEl);
            wrapperEl.appendChild(wordWrapperEl);

            searchResultsEl.appendChild(wrapperEl);
        }

        /**
         * Consider use of `this.updateProgressBar` instead
         */
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
                    e.stopPropagation();

                    addClass(searchResultsEl, 'translations');
                    searchResultsEl.style.display = "block";
                    searchResultsEl.innerHTML = "";

                    storage.search(this.value, updateSearchResults);
                }
            });
        };

        /**
         * Updates progress bar and activates search box once percentage >= 100
         *
         * @param {Number} percentage
         */
        //this.updateProgressBar = function (percentage) {
        //    progressEl.innerText = percentage + "%";
        //    progressEl.style.width = percentage + "%"
        //
        //    if (percentage >= 100) {
        //        progressEl.setAttribute('class', 'hidden');
        //
        //        this.listenToSearchBox();
        //        // show all words at first
        //        searchBox.dispatchEvent(new Event("keyup"));
        //    }
        //};

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
