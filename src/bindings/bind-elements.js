import {handleXFor} from '../features/x-for.js';
import {handleXIf} from '../features/x-if.js';
import {bindModelToTextContent} from './bind-text.js';
import {getNestedValue, setNestedValue} from './nested-value.js';

/**
 *
 * @param model
 * @param {any} parent
 */
function bindElements(model, parent = document) {
    // Obsługa dyrektywy `x-if`
    handleXIf(parent);

    // Obsługa dyrektywy `x-for`
    handleXFor(parent);

    // Obsługa bindowania inputów
    parent.querySelectorAll('[x-model]').forEach((el) => {
        const key = el.getAttribute('x-model');
        const value = getNestedValue(model, key);

        // Ustawienie początkowej wartości
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = value || '';
        } else {
            el.textContent = value || '';
        }

        // Nasłuchiwanie na zmiany w polach formularza
        el.addEventListener('input', (e) => {
            const newValue = e.target.value;
            setNestedValue(model, key, newValue); // Aktualizacja zagnieżdżonej wartości w modelu
        });
    });

    // Obsługa tekstu dynamicznego
    bindModelToTextContent(model);
}

export {bindElements};
