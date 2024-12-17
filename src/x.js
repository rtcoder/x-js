import {bindElements} from './bindings/bind-elements.js';
import {reactive} from './reactive-handler.js';

function appX(data) {
    const model = reactive(data);
    bindElements(model);
}

export {appX};
