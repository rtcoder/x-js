function reactive(data) {
    console.log(data);
    const bindings = new Map(); // Powiązania inputów
    const textBindings = new Map(); // Powiązania tekstów w DOM

    const handler = {
        get(target, key) {
            return Reflect.get(target, key);
        },
        set(target, key, value) {
            Reflect.set(target, key, value);

            // Aktualizuj powiązane inputy
            if (bindings.has(key)) {
                bindings.get(key).forEach((el) => {
                    if (el.type === 'checkbox') {
                        el.checked = value;
                    } else if (el.type === 'radio') {
                        el.checked = el.value === value;
                    } else {
                        el.value = value;
                    }
                });
            }

            // Aktualizuj powiązane teksty
            if (textBindings.has(key)) {
                textBindings.get(key).forEach((updateText) => updateText());
            }

            return true;
        },
    };

    const proxy = new Proxy(data, handler);

    proxy.bind = (key, element) => {
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
        console.log(element);
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

    proxy.bindText = (el) => {
        const originalText = el.textContent;

        // Szukaj wzorców {key}
        const matches = originalText.match(/{\s*[\w.]+\s*}/g);
        if (matches) {
            const updateText = () => {
                el.textContent = originalText.replace(/{\s*([\w.]+)\s*}/g, (_, key) => proxy[key] || '');
            };

            // Zarejestruj każdą kluczową właściwość
            matches.forEach((match) => {
                const key = match.replace(/[{}]/g, '').trim();
                if (!textBindings.has(key)) textBindings.set(key, []);
                textBindings.get(key).push(updateText);
            });

            // Pierwsza aktualizacja
            updateText();
        }
    };

    return proxy;
}

/**
 *
 * @param model
 * @param {any} parent
 */
function bindElements(model, parent = document) {
    // Obsługa dyrektywy `x-if`
    parent.querySelectorAll('[x-if]').forEach((el) => {
        const key = el.getAttribute('x-if');
        const placeholder = document.createComment(`x-if="${key}"`);
        el.parentNode.insertBefore(placeholder, el);
        el.parentNode.removeChild(el);  // Usuwamy oryginalny element (z dyrektywą `x-if`)

        const updateVisibility = () => {
            if (model[key]) {
                if (!el.parentNode) {
                    placeholder.parentNode.insertBefore(el, placeholder.nextSibling);  // Wstawiamy element
                }
            } else {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);  // Usuwamy element
                }
            }
        };

        // Obserwowanie zmian wartości w modelu
        model.bindText({textContent: ''}, key);  // Wymuszamy początkową aktualizację
        updateVisibility();

// Reakcja na zmiany w modelu (tu wykorzystujemy setter dla zmiennej)
        Object.defineProperty(model, key, {
            get: function() {
                return this[`_${key}`];
            },
            set: function(value) {
                this[`_${key}`] = value;
                updateVisibility();  // Zaktualizuj widoczność po zmianie wartości
            }
        });
    });

    // Obsługa dyrektywy `x-for`
    parent.querySelectorAll('[x-for]').forEach((el) => {
        const expression = el.getAttribute('x-for');
        const [itemKey, arrayKey] = expression.split(' in ').map((str) => str.trim());
        const placeholder = document.createComment(`x-for="${expression}"`);
        el.parentNode.insertBefore(placeholder, el);
        el.parentNode.removeChild(el);


        const updateList = () => {
            const items = model[arrayKey] || [];

            // Usuwamy poprzednie elementy (poza placeholderem)
            let nextNode = placeholder.nextSibling;
            while (nextNode && nextNode.nodeType !== Node.COMMENT_NODE) {
                const currentNode = nextNode;
                nextNode = currentNode.nextSibling;
                currentNode.remove();
            }

            // Renderujemy elementy w porządku tablicy
            items.forEach((item) => {
                const localModel = reactive({[itemKey]: item});
                const clone = el.cloneNode(true);  // Tworzymy nową kopię elementu
                clone.removeAttribute('x-for');  // Usuwamy atrybut x-for

                // Wstawiamy elementy w odpowiedniej kolejności
                placeholder.parentNode.appendChild(clone);

                // Bindowanie modelu dla każdego elementu
                bindElements(localModel, placeholder.parentNode);
            });
        };

        // Bindowanie tekstu dla tablicy
        model.bindText({textContent: ''}, arrayKey); // Wymuszamy pierwszą aktualizację
        updateList();
    });
    // Obsługa bindowania inputów
    parent.querySelectorAll('[x-model]').forEach((el) => {
        const key = el.getAttribute('x-model');
        model.bind(key, el);
    });

    // Obsługa tekstu dynamicznego
    parent.querySelectorAll('*').forEach((el) => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            model.bindText(el);
        }
    });
}

export {reactive, bindElements};
