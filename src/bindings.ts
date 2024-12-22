export type Binding = {
  path: string,
  placeholder: string,
};
export type Bindings = Binding[];

export function getBindings(element:HTMLElement): Bindings {
  const textBindings = getBindingsForText(element.textContent);
  if(element.nodeType === Node.TEXT_NODE) {
    return textBindings;
  }
  const attributeBindings=[];
  const xModel = element.getAttribute('@model');
  if(xModel) {
    attributeBindings.push({path: xModel, placeholder: xModel});
  }
  return [...textBindings, ...attributeBindings];
}
export function getBindingsForText(content: string | null): Bindings {
  if (!content) {
    return [];
  }
  const matches = Array.from(content.matchAll(/\{\s*([\w.]+)\s*\}/g));
  return matches.map((match) => ({
    path: match[1].trim(),
    placeholder: match[0],
  }));
}
