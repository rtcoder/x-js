/**
 *
 * @param {Document|HTMLElement} parent
 * @param model
 * @return void
 */
function handleXIf(parent: any, model: any) {
  parent.querySelectorAll('[x-if]').forEach((el:any) => {
    const key = el.getAttribute('x-if');
    const placeholder = document.createComment(`x-if="${key}"`);
    el.parentNode.insertBefore(placeholder, el);
    el.parentNode.removeChild(el);  // Usuwamy oryginalny element (z dyrektywą `x-if`)

    const updateVisibility = () => {
      if (model[key]) {
        if (!el.parentNode) {
          placeholder.parentNode?.insertBefore(el, placeholder.nextSibling);  // Wstawiamy element
        }
      } else {
        if (el.parentNode) {
          el.parentNode.removeChild(el);  // Usuwamy element
        }
      }
    };

    updateVisibility();

    // Zmiana w modelu, zaktualizuj widoczność
    Object.defineProperty(model, key, {
      get: function () {
        return this[`_${key}`];
      },
      set: function (value: any) {
        this[`_${key}`] = value;
        updateVisibility();  // Zaktualizuj widoczność po zmianie wartości
      },
    });
  });
}

export {handleXIf};
