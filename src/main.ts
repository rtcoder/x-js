type MixedObject = {
  [key: string]: any;
}
type XInstanceData = {
  container: HTMLElement | string;
  data: MixedObject;
  methods?: MixedObject;
}
type Binding = {
  path: string,
  placeholder: string,
};
type Bindings = Binding[];
type VNode = {
  type: string;
  props: MixedObject;
  content: string | null;
  children: VNode[];
  element: HTMLElement;
  bindPathList: Bindings;
}
const MODEL_PROP = '@model';
const CLICK_PROP = '@click';
const IF_PROP = '@if';

function getBindings(element: HTMLElement): Bindings {
  const textBindings = getBindingsForText(element.textContent);
  if (element.nodeType === Node.TEXT_NODE) {
    return textBindings;
  }
  const attributeBindings = [];
  const xModel = element.getAttribute(MODEL_PROP);
  if (xModel) {
    attributeBindings.push({path: xModel, placeholder: xModel});
  }
  return [...textBindings, ...attributeBindings];
}

function getBindingsForText(content: string | null): Bindings {
  if (!content) {
    return [];
  }
  const matches = Array.from(content.matchAll(/\{\s*([\w.]+)\s*\}/g));
  return matches.map((match) => ({
    path: match[1].trim(),
    placeholder: match[0],
  }));
}

function getChildren(element: HTMLElement): VNode[] {
  return Array.from(element.childNodes).map((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return createVirtualDOM(child as HTMLElement);
    } else if (child.nodeType === Node.TEXT_NODE) {
      return {
        type: 'text',
        content: child.textContent,
        props: {},
        children: [],
        element: child,
        bindPathList: getBindingsForText(child.textContent),
      };
    } else if (child.nodeType === Node.COMMENT_NODE) {
      return {
        type: 'comment',
        content: child.textContent,
        props: {},
        children: [],
        element: child,
        bindPathList: getBindingsForText(child.textContent),
      };
    }
  }).filter(Boolean) as VNode[];
}

 function createVirtualDOM(element: HTMLElement): VNode {
  const type = element.tagName.toLowerCase();
  const props: MixedObject = {};
  const content = element.textContent;

  Array.from(element.attributes).forEach((attr) => {
    props[attr.name] = attr.value;
  });

  const children = getChildren(element);
  const bindings = element.childNodes.length ? [] : getBindings(element);
  return {type, props, children, content, element, bindPathList: bindings};
}

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
    if (childVNode.props[IF_PROP]) {
      const condition = childVNode.props[IF_PROP];
      const isVisible = new Function('model', `with(model) { return ${condition}; }`)(model);

      if (!isVisible) {
        childVNode.element.style.display = 'none';
        return;
      } else {
        childVNode.element.style.display = '';
      }
    }
    if (childVNode.children.length) {
      updateHTML(root, childVNode, model, path);
    }
    if (childVNode.props[MODEL_PROP] === path) {
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
}

function bindClick(element: HTMLElement, model: any): void {
  const clickHandler = element.getAttribute(CLICK_PROP);
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
    const {props, element} = vNode;
    // Obsługa @if
    if (props[IF_PROP]) {
      const condition = props[IF_PROP];
      const isVisible = new Function('model', `with(model) { return ${condition}; }`)(model);

      if (!isVisible) {
        element.style.display = 'none';
        return;
      } else {
        element.style.display = '';
      }
    }
    if (props[MODEL_PROP]) {
      bindXModel(parentElement, reactiveModel, props[MODEL_PROP]);
    }

    if (props[CLICK_PROP]) {
      bindClick(parentElement, reactiveModel);
    }

    bindPlaceholdersUsingVirtualDOM(vNode, reactiveModel);

    vNode.children.forEach((childVNode, index) => {
      if (typeof childVNode === 'object') {
        console.log(parentElement)
        const childElement = parentElement.childNodes[index] as HTMLElement;
        console.log(childElement,childVNode);
        processVNode(childVNode, childElement);
      }
    });
  }


  processVNode(virtualDOM, root);
}

