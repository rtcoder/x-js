import {bindElements} from './bindings/bind-elements';
import {reactive} from './reactive-handler';

function appX(data: any) {
  const model = reactive(data);
  bindElements(model);
}

export {appX};
