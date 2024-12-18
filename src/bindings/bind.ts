/**
 *
 * @param {object} proxy
 * @param {Map} bindings
 * @return {(function(key:string, element:HTMLElement): void)}
 */
function getBindMethod(proxy: any, bindings: Map<any, any>) {
  /**
   * @property {string} key
   * @property {HTMLElement} element
   */
  return (key:string, element:any) => {
    if (!bindings.has(key)) {
      bindings.set(key, []);
    }
    bindings.get(key).push(element);

    // Synchronizacja początkowa
    if (element.type === 'checkbox') {
      element.checked = proxy[key];
    } else if (element.type === 'radio') {
      element.checked = element.value === proxy[key];
    } else {
      element.value = proxy[key];
    }

    // DOM to model
    element.addEventListener('input', () => {
      if (element.type === 'checkbox') {
        proxy[key] = element.checked;
      } else if (element.type === 'radio') {
        if (element.checked) proxy[key] = element.value;
      } else {
        proxy[key] = element.value;
      }
    });

    // Obsługa select
    if (element.tagName === 'SELECT') {
      element.addEventListener('change', () => {
        proxy[key] = element.value;
      });
    }
  };
}

export {getBindMethod};
