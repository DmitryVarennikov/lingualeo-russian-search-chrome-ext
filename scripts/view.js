'use strict';

define([], function () {
    function View(storage) {
        if (! (this instanceof View)) {
            throw new Error('`this` must be an instance of View');
        }


        var searchResultsEl = document.getElementById('search-results');
        var searchBox = document.getElementsByName('search-box')[0];
        var progressEl = document.getElementById('progress').children[0];


        function updateSearchResults(word) {
            var translations = [];
            word.user_translates.forEach(function (translation) {
                translations.push(translation.translate_value);
            });

            var termEl = document.createElement('span');
            termEl.setAttribute('class', 'term');
            termEl.setAttribute('title', word.transcription);
            termEl.innerText = word.word_value;

            var dashEl = document.createElement('span');
            dashEl.innerHTML = " &mdash; ";

            var translationsEl = document.createElement('span');
            translationsEl.setAttribute('class', 'translations');
            translationsEl.innerText = translations.join('; ');

            var wrapperEl = document.createElement('div');
            wrapperEl.appendChild(termEl);
            wrapperEl.appendChild(dashEl);
            wrapperEl.appendChild(translationsEl);

            searchResultsEl.appendChild(wrapperEl);
        }

        /**
         * Consider use of `this.updateProgressBar` instead
         */
        this.listenToSearchBox = function () {
            searchBox.removeAttribute('disabled');

            searchBox.addEventListener('keyup', function (e) {
                searchResultsEl.innerHTML = '';

                storage.search(this.value, updateSearchResults);
            });
        };

        /**
         * Updates progress bar and activates search box once percentage >= 100
         *
         * @param {Number} percentage
         */
        this.updateProgressBar = function (percentage) {
            progressEl.innerText = percentage + "%";
            progressEl.style.width = percentage + "%"

            if (percentage >= 100) {
                progressEl.setAttribute('class', 'hidden');

                this.listenToSearchBox();
                // show all words at first
                searchBox.dispatchEvent(new Event("keyup"));
            }
        };
    }

    return View;
});
