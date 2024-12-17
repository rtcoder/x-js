import {reactive} from '../reactive-handler.js';

/**
 *
 * @param {Document|HTMLElement} parent
 * @return void
 */
function handleXFor(parent) {
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

        updateList();
    });
}

export {handleXFor};
