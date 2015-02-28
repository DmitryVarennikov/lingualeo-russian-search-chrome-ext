'use strict';

define([], function () {
    function View(storage) {
        if (! (this instanceof View)) {
            throw new Error('`this` must be an instance of View');
        }

        var contentEl = document.getElementById('content'),
            searchResultsEl = contentEl.getElementsByClassName('dict-short-view')[0],
            notFoundEl = contentEl.getElementsByClassName('not-found')[0],
            notFoundImageEl = contentEl.getElementsByClassName('not-found-image')[0],
            searchBox = document.getElementsByName('search')[0],
            clearSearchBox = contentEl.getElementsByClassName('clear-search')[0];

        //var progressEl = document.getElementById('progress').children[0];


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
                word.groups.forEach(function (group) {
                    var groupLinkEl = document.createElement('a');
                    groupLinkEl.setAttribute('class', 't-ellps link-gray-dotted');
                    groupLinkEl.dataset.wordGroup = group;
                    // @TODO: owner?
                    groupLinkEl.dataset.wordGroupType = "owner";
                    groupLinkEl.innerText = "group name";

                    groupsEl.appendChild(groupLinkEl);
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
            wrapperEl.setAttribute('class', 'dict-item-word');
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
            clearSearchBox.addEventListener('click', function(e) {
                searchResultsEl.innerHTML = '';
            });

            searchBox.addEventListener('keyup', function (e) {
                searchResultsEl.style.display = "block";
                searchResultsEl.innerHTML = '';

                // @fixme: does not work
                //notFoundEl.style.display = "none";
                //notFoundImageEl.style.display = "none";

                if (isCyrillicInput(this.value)) {
                    e.stopPropagation();

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
