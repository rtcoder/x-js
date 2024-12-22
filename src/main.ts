import {VNode} from './types/v-node.ts';
import {XInstanceData} from './types/x-instance-data.ts';
import {createVirtualDOM} from './virtual-dom.ts';

function createReactiveModel(model: any, onChange: (path: string) => void): any {
  function createProxy(obj: any, path: string[] = []): any {
    return new Proxy(obj, {
      get(target, key) {
        const value = target[key];
        if (typeof value === 'object' && value !== null) {
          return createProxy(value, [...path, key as string]);
        }
        return value;
      },
      set(target, key, value) {
        console.log('Model changed at:', [...path, key as string].join('.'), 'New value:', value);
        target[key] = value;
        onChange([...path, key as string].join('.'));
        return true;
      },
    });
  }

  return createProxy(model);
}

function updateHTML(root: HTMLElement, vDom: VNode, model: any, path: string): void {
  vDom.children.forEach((childVNode, index) => {
    if (childVNode.children.length) {
      updateHTML(root, childVNode, model, path);
    }
    if (childVNode.props['x-model'] === path) {
      const value = path.split('.').reduce((obj, key) => obj[key], model);
      if (childVNode.element.tagName === 'INPUT') {
        const input = childVNode.element as HTMLInputElement;
        if (input.value !== value) {
          input.value = value;
        }
      } else {
        childVNode.element.textContent = value;
      }
      return;
    }
    if (!childVNode.bindPathList.length) {
      return;
    }

    const foundBindings = childVNode.bindPathList.filter((bindPath) => bindPath.path === path);
    if (!foundBindings.length) {
      return;
    }
    let newContent = childVNode.content || '';
    childVNode.bindPathList.forEach((binding) => {
      const value = binding.path.split('.').reduce((obj, key) => obj[key], model);
      newContent = newContent!.replace(binding.placeholder, value ?? '');
    });
    childVNode.element.textContent = newContent;
  });
}

function bindXModel(element: HTMLElement, model: any, path: string): void {
  const target = path.split('.').reduce((obj, key) => obj[key], model);

  if (element.tagName === 'INPUT') {
    const input = element as HTMLInputElement;

    // Ustaw wartość początkową
    input.value = target;

    // Zdarzenie na zmianę wartości
    input.addEventListener('input', (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      const targetObject = keys.reduce((obj, key) => obj[key], model);
      targetObject[lastKey] = newValue; // To wywoła Proxy
    });
  } else {
    // Ustaw tekst początkowy
    console.log({target});
    element.textContent = target;
  }

  // Dodaj atrybut do identyfikacji elementu podczas aktualizacji
  element.setAttribute('data-bind-path', path);
}

function bindClick(element: HTMLElement, model: any): void {
  const clickHandler = element.getAttribute('@click');
  if (clickHandler) {
    const fn = new Function('model', `with(model) { ${clickHandler} }`);
    element.addEventListener('click', () => fn(model));
  }
}

function bindPlaceholdersUsingVirtualDOM(vNode: VNode, model: any): void {
  const {content, props, element, bindPathList} = vNode;
  console.log('element', element);
  if (content && content.includes('{') && content.includes('}') && element.nodeType === Node.TEXT_NODE) {

    const updateText = () => {
      let updatedText = content;
      bindPathList.forEach(({path, placeholder}) => {
        const value = path.split('.').reduce((obj, key) => obj[key], model);
        updatedText = updatedText.replace(placeholder, value ?? '');
      });
      element.textContent = updatedText;
    };

    updateText();

    // Odświeżanie tekstu na zmianę modelu
    bindPathList.forEach(({path}) => {
      createReactiveModel(model, (updatedPath) => {
        if (updatedPath.startsWith(path.split('.')[0])) {
          updateText();
        }
      });
    });
  }

  // Przetwarzaj dzieci rekurencyjnie
  vNode.children.forEach((childVNode) => {
    if (typeof childVNode === 'object') {
      bindPlaceholdersUsingVirtualDOM(childVNode, model);
    }
  });
}

export function initializeAppWithVirtualDOM(instanceData: XInstanceData): void {
  const {container, data: model} = instanceData;
  const root = typeof container === 'string'
    ? document.querySelector(container) as HTMLElement
    : container;

  const virtualDOM = createVirtualDOM(root);

  console.log(virtualDOM);

  const reactiveModel = createReactiveModel(model, (path) => {
    updateHTML(root, virtualDOM, reactiveModel, path);
  });

  function processVNode(vNode: VNode, parentElement: HTMLElement): void {
    if (vNode.props['x-model']) {
      bindXModel(parentElement, reactiveModel, vNode.props['x-model']);
    }

    if (vNode.props['@click']) {
      bindClick(parentElement, reactiveModel);
    }

    bindPlaceholdersUsingVirtualDOM(vNode, reactiveModel);

    vNode.children.forEach((childVNode, index) => {
      if (typeof childVNode === 'object') {
        const childElement = parentElement.childNodes[index] as HTMLElement;
        processVNode(childVNode, childElement);
      }
    });
  }

  processVNode(virtualDOM, root);
}

