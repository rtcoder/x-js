export type Binding = {
  path: string,
  placeholder: string,
};
export type Bindings = Binding[];

export function getBindings(content: string | null): Bindings {
  if (!content) {
    return [];
  }
  const matches = Array.from(content.matchAll(/\{\s*([\w.]+)\s*\}/g));
  return matches.map((match) => ({
    path: match[1].trim(),
    placeholder: match[0],
  }));
}
