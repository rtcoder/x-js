import {handleXFor} from '../features/x-for';
import {handleXIf} from '../features/x-if';
import {bindModelToTextContent} from './bind-text';
import {getNestedValue, setNestedValue} from './nested-value';

/**
 *
 * @param model
 * @param {any} parent
 */
function bindElements(model:any, parent: any = document) {
  // Obsługa dyrektywy `x-if`
  handleXIf(parent, model);

  // Obsługa dyrektywy `x-for`
  handleXFor(parent, model);

  // Obsługa bindowania inputów
  parent.querySelectorAll('[x-model]').forEach((el:any) => {
    const key = el.getAttribute('x-model');
    const value = getNestedValue(model, key);

    // Ustawienie początkowej wartości
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = value || '';
    } else {
      el.textContent = value || '';
    }

    // Nasłuchiwanie na zmiany w polach formularza
    el.addEventListener('input', (e:any) => {
      const newValue = e.target.value;
      setNestedValue(model, key, newValue); // Aktualizacja zagnieżdżonej wartości w modelu
    });
  });

  // Obsługa tekstu dynamicznego
  bindModelToTextContent(model);
}

export {bindElements};
