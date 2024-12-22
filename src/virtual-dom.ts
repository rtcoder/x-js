import {getBindings, getBindingsForText} from './bindings.ts';
import {MixedObject} from './types/mixed-object.ts';
import {VNode} from './types/v-node.ts';

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
    }
  }).filter(Boolean) as VNode[];
}

export function createVirtualDOM(element: HTMLElement): VNode {
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
