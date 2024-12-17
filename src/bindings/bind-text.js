import {getNestedValue} from './nested-value.js';

function bindModelToTextContent(model) {
    document.querySelectorAll('*').forEach((el) => {
        if (el.tagName === 'SCRIPT') {
            return;
        }
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            model.bindText(el);
        }
    });
}

/**
 *
 * @param {object} proxy
 * @param {Map} textBindings
 * @return {(function(el:HTMLElement): void)}
 */
function getBindTextMethod(proxy, textBindings) {
    /**
     * @property {HTMLElement} el
     */
    return (el) => {
        const xModelAttr = el.getAttribute('x-model');
        if (!xModelAttr) {
            if (!el.dataset.originalContent) {
                el.dataset.originalContent = el.textContent;
            }
        } else {
            el.dataset.originalContent = `{${xModelAttr}}`;
        }
        const originalText = el.dataset.originalContent;

        // Szukaj wzorców {key}
        const matches = originalText.match(/{\s*[\w.]+\s*}/g);
        if (matches) {
            const updateText = () => {
                // Aktualizujemy tekst, uwzględniając zagnieżdżone właściwości
                el.textContent = originalText.replace(/{\s*([\w.]+)\s*}/g, (_, key) => {
                    return getNestedValue(proxy, key.trim()) || '';
                });
            };

            // Zarejestruj każdą kluczową właściwość
            matches.forEach((match) => {
                const key = match.replace(/[{}]/g, '').trim();
                if (!textBindings.has(key)) {
                    textBindings.set(key, []);
                }
                textBindings.get(key).push(updateText);
            });
            updateText();
        }
    };
}

export {getBindTextMethod, bindModelToTextContent};
