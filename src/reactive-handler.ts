import {getBindMethod} from './bindings/bind';
import {getBindTextMethod} from './bindings/bind-text';

/**
 *
 * @param {object} data
 * @return {object|any|boolean}
 */
function reactive(data: any) {
  const bindings = new Map(); // Powiązania inputów
  const textBindings = new Map(); // Powiązania tekstów w DOM

  const handler = {
    get(target: any, key: any) {
      return Reflect.get(target, key);
    },
    set(target: any, key: any, value: any) {
      const success = Reflect.set(target, key, value);

      // Zaktualizuj powiązane inputy
      if (bindings.has(key)) {
        bindings.get(key).forEach((el: any) => {
          if (el.type === 'checkbox') {
            el.checked = value;
          } else if (el.type === 'radio') {
            el.checked = el.value === value;
          } else {
            el.value = value;
          }
        });
      }

      // Zaktualizuj powiązane teksty
      if (textBindings.has(key)) {
        textBindings.get(key).forEach((updateText: any) => updateText());
      }

      // Sprawdź zagnieżdżone obiekty i aktualizuj je w razie potrzeby
      if (key.includes('.')) {
        const nestedKeys = key.split('.');
        let nestedModel = target;
        for (let i = 0; i < nestedKeys.length - 1; i++) {
          nestedModel = nestedModel[nestedKeys[i]];
        }
        const nestedKey = nestedKeys[nestedKeys.length - 1];
        if (nestedModel && nestedModel.hasOwnProperty(nestedKey)) {
          nestedModel[nestedKey] = value;
        }
      }

      return success;
    },
  };

  const proxy = new Proxy(data, handler);

  proxy.bind = getBindMethod(proxy, bindings);
  proxy.bindText = getBindTextMethod(proxy, textBindings);

  return proxy;
}

export {reactive};
