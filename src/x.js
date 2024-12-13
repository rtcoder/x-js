function reactive(data) {
    const bindings = new Map(); // Powiązania inputów
    const textBindings = new Map(); // Powiązania tekstu

    const handler = {
        get(target, key) {
            return Reflect.get(target, key);
        },
        set(target, key, value) {
            Reflect.set(target, key, value);

            // Aktualizuj powiązane inputy
            if (bindings.has(key)) {
                bindings.get(key).forEach((el) => (el.value = value));
            }

            // Aktualizuj powiązane teksty
            if (textBindings.has(key)) {
                textBindings.get(key).forEach((updateText) => updateText());
            }

            return true;
        }
    };

    const proxy = new Proxy(data, handler);

    proxy.bind = (key, element) => {
        if (!bindings.has(key)) bindings.set(key, []);
        bindings.get(key).push(element);

        // Synchronizacja początkowa
        element.value = proxy[key];

        // DOM to model
        element.addEventListener('input', (e) => {
            proxy[key] = e.target.value;
        });
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
                if (!textBindings.has(key)) {
                    textBindings.set(key, []);
                }
                textBindings.get(key).push(updateText);
            });

            // Pierwsza aktualizacja
            updateText();
        }
    };

    return proxy;
}

function bindElements(model) {
    // Bindowanie inputów
    document.querySelectorAll('[x-model]').forEach((el) => {
        const key = el.getAttribute('x-model');
        model.bind(key, el);
    });

    // Bindowanie tekstu
    document.querySelectorAll('*').forEach((el) => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            model.bindText(el);
        }
    });
}

export { reactive, bindElements };
