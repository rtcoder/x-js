export type ProxyObject = {
  [key: string]: any;
  bind: (key: string, element: any) => void;
  bindText: (element: HTMLElement) => void;
}
