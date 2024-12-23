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
  placeholder: string | null,
};
type Bindings = Binding[];
type ForConfig = {
  item: string; // Nazwa zmiennej iteracyjnej (np. 'item')
  list: string; // Wyrażenie reprezentujące listę w modelu (np. 'items' lub 'model.items')
}
type VNode = {
  type: string;
  props: MixedObject;
  content: string | null;
  children: VNode[];
  element: HTMLElement;
  bindPathList: Bindings;
  forConfig: ForConfig | null;
}
const MODEL_PROP = '@model';
const CLICK_PROP = '@click';
const IF_PROP = '@if';
const FOR_PROP = '@for';

function getBindings(element: HTMLElement): Bindings {
  const attributeBindings: Bindings = [];
  const xFor = element.getAttribute(FOR_PROP);
  if (xFor) {
    const [, list] = xFor.split(' in ');
    attributeBindings.push({path: list, placeholder: null});
    return attributeBindings;
  }
  if (element.childNodes.length) {
    return [];
  }
  const textBindings = getBindingsForText(element.textContent);
  if (element.nodeType === Node.TEXT_NODE) {
    return textBindings;
  }
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
        forConfig: null,
      };
    } else if (child.nodeType === Node.COMMENT_NODE) {
      return {
        type: 'comment',
        content: child.textContent,
        props: {},
        children: [],
        element: child,
        bindPathList: getBindingsForText(child.textContent),
        forConfig: null,
      };
    }
  }).filter(Boolean) as VNode[];
}

function parseForDirective(forValue: string): ForConfig {
  const match = forValue.match(/(\w+)\s+in\s+(.+)/);
  if (!match) {
    throw new Error(`Invalid @for syntax: ${forValue}`);
  }
  return {item: match[1], list: match[2]};
}

function createVirtualDOM(element: HTMLElement): VNode {
  const type = element.tagName.toLowerCase();
  const props: MixedObject = {};
  const content = element.textContent;

  Array.from(element.attributes).forEach((attr) => {
    props[attr.name] = attr.value;
  });
// Obsługa @for
  const forDirective = props[FOR_PROP];
  let forConfig = null;
  if (forDirective) {
    forConfig = parseForDirective(forDirective);
  }
  const children = getChildren(element);
  const bindings = getBindings(element);
  element.removeAttribute(MODEL_PROP);
  element.removeAttribute(IF_PROP);
  element.removeAttribute(FOR_PROP);
  element.removeAttribute(CLICK_PROP);
  return {
    type,
    props,
    children,
    content,
    element,
    bindPathList: bindings,
    forConfig,
  };
}

function createReactiveModel(model: any, onChange: (path: string) => void): any {
  function createProxy(obj: any, path: string[] = []): any {
    if (Array.isArray(obj)) {
      // Obsługa tablic
      return new Proxy(obj, {
        get(target, key: any) {
          console.log(path);
          console.log(key);
          console.log('Tablica odczytana:', [...path, key as string].join('.'));
          if (typeof key === 'string' && ['push', 'pop', 'splice', 'shift', 'unshift'].includes(key)) {
            return (...args: any[]) => {
              const result = Array.prototype[key as any].apply(target, args) as any;
              // Powiadom o zmianach w tablicy
              onChange(path.join('.'));
              return result;
            };
          }

          const value = target[key as any];
          if (typeof value === 'object' && value !== null) {
            return createProxy(value, [...path, key as string]);
          }
          return value;
        },
        set(target, key, value) {
          console.log('Tablica zmieniona:', [...path, key as string].join('.'), 'Nowa wartość:', value);
          target[key as any] = value;
          onChange(path.join('.'));
          return true;
        },
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // Obsługa obiektów
      return new Proxy(obj, {
        get(target, key) {
          const value = target[key];
          if (typeof value === 'object' && value !== null) {
            return createProxy(value, [...path, key as string]);
          }
          return value;
        },
        set(target, key, value) {
          console.log('Model zmieniony:', [...path, key as string].join('.'), 'Nowa wartość:', value);
          target[key] = value;
          onChange([...path, key as string].join('.'));
          return true;
        },
      });
    }
    return obj;
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
    childVNode.bindPathList
      .filter((b) => !!b.placeholder)
      .forEach((binding) => {
        const value = binding.path.split('.').reduce((obj, key) => obj[key], model);
        newContent = newContent!.replace(binding.placeholder!, value ?? '');
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
    element.textContent = target;
  }
}

function bindClick(element: HTMLElement, vNode: VNode, model: any): void {
  const clickHandler = vNode.props[CLICK_PROP];
  if (clickHandler) {
    const fn = new Function('model', `with(model) { ${clickHandler} }`);
    element.addEventListener('click', () => fn(model));
  }
}

function bindPlaceholdersUsingVirtualDOM(vNode: VNode, model: any): void {
  const {content, props, element, bindPathList, forConfig} = vNode;

  if (forConfig) {
    return;
  }
  if (content && content.includes('{') && content.includes('}') && element.nodeType === Node.TEXT_NODE) {

    const updateText = () => {
      let updatedText = content;
      bindPathList
        .filter((b) => !!b.placeholder)
        .forEach(({path, placeholder}) => {
          const value = path.split('.').reduce((obj, key) => obj[key], model);
          updatedText = updatedText.replace(placeholder!, value ?? '');
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
  const {container, data} = instanceData;
  const root = typeof container === 'string'
    ? document.querySelector(container) as HTMLElement
    : container;

  const virtualDOM = createVirtualDOM(root);

  console.log(virtualDOM);

  const reactiveModel = createReactiveModel(data, (path) => {
    updateHTML(root, virtualDOM, reactiveModel, path);
  });

  function processVNode(vNode: VNode, parentElement: HTMLElement, model: any): void {
    const {props, element, forConfig} = vNode;
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
    // Obsługa @for
    if (forConfig) {
      const {item, list} = forConfig;
      const fn = new Function('model', `with(model) { return ${list}; }`);
      const dataList = fn(model);

      // Usuń oryginalny element z DOM (będzie zastąpiony klonami)
      element.style.display = 'none';
      const fragment = document.createDocumentFragment();
      dataList.forEach((dataItem: any) => {
        const localModel = {[item]: dataItem};

        // Klonuj element
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.removeAttribute('@for');
        clonedElement.style.display = ''; // Odsłoń klon

        // Stwórz wirtualny DOM dla klonu
        const clonedVNode = createVirtualDOM(clonedElement);

        // Przetwarzaj klon z lokalnym modelem
        processVNode(clonedVNode, clonedElement, localModel);

        fragment.appendChild(clonedElement);
      });

      parentElement.parentNode?.replaceChild(fragment, element);
      return;
    }
    if (props[MODEL_PROP]) {
      bindXModel(parentElement, reactiveModel, props[MODEL_PROP]);
    }

    if (props[CLICK_PROP]) {
      bindClick(parentElement, vNode, reactiveModel);
    }

    bindPlaceholdersUsingVirtualDOM(vNode, model);

    vNode.children.forEach((childVNode, index) => {
      if (typeof childVNode === 'object') {
        const childElement = parentElement.childNodes[index] as HTMLElement;
        processVNode(childVNode, childElement, model);
      }
    });
  }


  processVNode(virtualDOM, root, data);
}

