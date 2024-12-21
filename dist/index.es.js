function f(n) {
  const t = document.createElement(n.type);
  n.content && (t.textContent = n.content);
  for (const [e, c] of Object.entries(n.props))
    if (e.startsWith("on") && typeof c == "function") {
      const r = e.slice(2).toLowerCase();
      t.addEventListener(r, c);
    } else
      t[e] = c;
  return n.children.forEach((e) => {
    const c = typeof e == "string" ? document.createTextNode(e) : f(e);
    t.appendChild(c);
  }), t;
}
function d(n, t, e, c = 0) {
  const r = n.childNodes[c];
  if (!e) {
    n.appendChild(f(t));
    return;
  }
  if (!t) {
    r && n.removeChild(r);
    return;
  }
  if (t.type !== e.type) {
    n.replaceChild(f(t), r);
    return;
  }
  const o = r;
  for (const [i, a] of Object.entries(t.props))
    i.startsWith("on") || o[i] !== a && (o[i] = a);
  for (const i of Object.keys(e.props))
    i in t.props || (o[i] = void 0);
  const s = Math.max(t.children.length, e.children.length);
  for (let i = 0; i < s; i++)
    d(o, t.children[i], e.children[i], i);
}
function y(n) {
  const t = n.tagName.toLowerCase(), e = {}, c = n.textContent;
  Array.from(n.attributes).forEach((o) => {
    e[o.name] = o.value;
  });
  const r = Array.from(n.childNodes).map((o) => {
    if (o.nodeType === Node.ELEMENT_NODE)
      return y(o);
    if (o.nodeType === Node.TEXT_NODE)
      return { type: "text", props: { value: o.textContent }, children: [] };
  }).filter(Boolean);
  return { type: t, props: e, children: r, content: c };
}
function h(n, t, e) {
  const c = e.split(".").reduce((r, o) => r[o], t);
  if (n.tagName === "INPUT") {
    const r = n;
    r.value = c, r.addEventListener("input", (o) => {
      const s = o.target.value, i = e.split("."), a = i.pop(), u = i.reduce((l, p) => l[p], t);
      u[a] = s, console.log(`Zaktualizowano ${e}:`, t);
    });
  }
}
function E(n, t) {
  const e = n.getAttribute("@click");
  if (e) {
    const c = new Function("model", `with(model) { ${e} }`);
    n.addEventListener("click", () => c(t));
  }
}
function g(n, t) {
  const e = document.querySelector(n);
  function c(r) {
    const o = r.getAttribute("x-model");
    o && h(r, t, o), E(r, t), Array.from(r.children).forEach((s) => c(s));
  }
  c(e);
}
export {
  E as bindClick,
  h as bindXModel,
  y as createVirtualDOM,
  g as initializeApp,
  f as render,
  d as updateElement
};
//# sourceMappingURL=index.es.js.map
