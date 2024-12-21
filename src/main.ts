import {VNode} from './types/v-node.ts';

export function render(vNode: VNode): HTMLElement {
  const element = document.createElement(vNode.type);
  if (vNode.content) {
    element.textContent = vNode.content;
  }
  // Ustawienie atrybutów i zdarzeń
  for (const [key, value] of Object.entries(vNode.props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
    } else {
      (element as any)[key] = value; // np. element.value
    }
  }

  // Renderowanie dzieci
  vNode.children.forEach((child) => {
    const childElement = typeof child === 'string'
      ? document.createTextNode(child)
      : render(child);
    element.appendChild(childElement);
  });

  return element;
}

export function updateElement(parent: HTMLElement, newVNode: VNode, oldVNode?: VNode, index = 0): void {
  const child = parent.childNodes[index];

  // Jeśli stary węzeł nie istnieje, dodaj nowy
  if (!oldVNode) {
    parent.appendChild(render(newVNode));
    return;
  }

  // Jeśli nowy węzeł nie istnieje, usuń stary
  if (!newVNode) {
    if (child) parent.removeChild(child);
    return;
  }

  // Jeśli typ węzłów różni się, zastąp stary nowym
  if (newVNode.type !== oldVNode.type) {
    parent.replaceChild(render(newVNode), child!);
    return;
  }

  // Aktualizuj atrybuty
  const element = child as HTMLElement;
  for (const [key, value] of Object.entries(newVNode.props)) {
    if (key.startsWith('on')) {  // Zdarzenia są stałe
      continue;
    }

    if ((element as any)[key] !== value) {
      (element as any)[key] = value;
    }
  }

  // Usuwanie starych atrybutów
  for (const key of Object.keys(oldVNode.props)) {
    if (!(key in newVNode.props)) {
      (element as any)[key] = undefined;
    }
  }

  // Aktualizuj dzieci rekurencyjnie
  const maxLength = Math.max(newVNode.children.length, oldVNode.children.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(element, newVNode.children[i], oldVNode.children[i], i);
  }
}

export function createVirtualDOM(element: HTMLElement): VNode {
  const type = element.tagName.toLowerCase();
  const props: { [key: string]: any } = {};
  const content = element.textContent;
  // Przejdź przez atrybuty elementu
  Array.from(element.attributes).forEach((attr) => {
    props[attr.name] = attr.value;
  });

  // Przetwarzaj dzieci elementu rekurencyjnie
  const children = Array.from(element.childNodes).map((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return createVirtualDOM(child as HTMLElement);
    } else if (child.nodeType === Node.TEXT_NODE) {
      return {type: 'text', props: {value: child.textContent}, children: []};
    }
  }).filter(Boolean) as VNode[];

  return {type, props, children, content};
}

export function bindXModel(element: HTMLElement, model: any, path: string): void {
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
      targetObject[lastKey] = newValue;
      console.log(`Zaktualizowano ${path}:`, model);
    });
  }
}

export function bindClick(element: HTMLElement, model: any): void {
  const clickHandler = element.getAttribute('@click');
  if (clickHandler) {
    const fn = new Function('model', `with(model) { ${clickHandler} }`);
    element.addEventListener('click', () => fn(model));
  }
}

export function initializeApp(selector: string, model: any): void {
  const root = document.querySelector(selector) as HTMLElement;

  function processElement(element: HTMLElement): void {
    // Obsługa x-model
    const modelAttr = element.getAttribute("x-model");
    if (modelAttr) {
      bindXModel(element, model, modelAttr);
    }

    // Obsługa @click
    bindClick(element, model);

    // Rekurencyjnie przetwarzaj dzieci
    Array.from(element.children).forEach((child) => processElement(child as HTMLElement));
  }

  processElement(root);
}
