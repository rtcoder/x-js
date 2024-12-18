import {getNestedValue} from './nested-value';

function bindModelToTextContent(model:any) {
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
function getBindTextMethod(proxy:any, textBindings:Map<any, any>) {
  /**
   * @property {HTMLElement} el
   */
  return (el:any) => {
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
        el.textContent = originalText.replace(/{\s*([\w.]+)\s*}/g, (_:string, key:string) => {
          return getNestedValue(proxy, key.trim()) || '';
        });
      };

      // Zarejestruj każdą kluczową właściwość
      matches.forEach((match:string) => {
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
