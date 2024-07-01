// ==UserScript==
// @name         YouTube Comment Remover
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Filter YouTube comments based on user-defined word filters.
// @author       gianmnf
// @match        *://www.youtube.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Register menu command to open the options panel
    GM_registerMenuCommand('Set Comment Filters', openOptionsPanel);

    function openOptionsPanel() {
        let filters = prompt("Enter words to filter, separated by commas:", GM_getValue('filters', ''));
        let caseSensitive = confirm("Do you want the filter to be case-sensitive?");
        let exactMatch = confirm("Do you want to filter exact matches only?");

        GM_setValue('filters', filters);
        GM_setValue('caseSensitive', caseSensitive);
        GM_setValue('exactMatch', exactMatch);
    }

    const observer = new MutationObserver(filterComments);
    observer.observe(document, { childList: true, subtree: true });

    function filterComments() {
        const filters = GM_getValue('filters', '').split(',').map(f => f.trim());
        const caseSensitive = GM_getValue('caseSensitive', false);
        const exactMatch = GM_getValue('exactMatch', false);

        if (!filters.length) return;

        const comments = document.querySelectorAll('#content #content-text');
        comments.forEach(comment => {
            const text = comment.textContent;
            if (shouldRemoveComment(text, filters, caseSensitive, exactMatch)) {
                const commentElement = comment.closest('ytd-comment-thread-renderer');
                if (commentElement) {
                    commentElement.style.display = 'none';
                }
            }
        });
    }

    function shouldRemoveComment(text, filters, caseSensitive, exactMatch) {
        for (let filter of filters) {
            if (filter) {
                let pattern = caseSensitive ? filter : filter.toLowerCase();
                let targetText = caseSensitive ? text : text.toLowerCase();
                if (exactMatch ? targetText === pattern : targetText.includes(pattern)) {
                    return true;
                }
            }
        }
        return false;
    }
})();
