import {bindElements} from './bindings/bind-elements';
import {reactive} from './reactive-handler';

function appX(data) {
    const model = reactive(data);
    bindElements(model);
}

export {appX};
