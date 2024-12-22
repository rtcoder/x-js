function d(o, c) {
  function n(s, r = []) {
    return new Proxy(s, {
      get(t, i) {
        const e = t[i];
        return typeof e == "object" && e !== null ? n(e, [...r, i]) : e;
      },
      set(t, i, e) {
        return t[i] = e, c([...r, i].join(".")), !0;
      }
    });
  }
  return n(o);
}
function y(o, c, n) {
  [
    ...o.querySelectorAll(`[data-bind-path="${n}"]`).values()
  ].forEach((r) => {
    if (r.tagName === "INPUT") {
      const t = r, i = n.split(".").reduce((e, a) => e[a], c);
      t.value !== i && (t.value = i);
    } else {
      const t = r.textContent || "";
      t.includes("{") && t.includes("}") ? h(r, c) : r.textContent = n.split(".").reduce((i, e) => i[e], c);
    }
  });
}
function p(o) {
  const c = document.createElement(o.type);
  o.content && (c.textContent = o.content);
  for (const [n, s] of Object.entries(o.props))
    if (n.startsWith("on") && typeof s == "function") {
      const r = n.slice(2).toLowerCase();
      c.addEventListener(r, s);
    } else
      c[n] = s;
  return o.children.forEach((n) => {
    const s = typeof n == "string" ? document.createTextNode(n) : p(n);
    c.appendChild(s);
  }), c;
}
function x(o, c, n, s = 0) {
  const r = o.childNodes[s];
  if (!n) {
    o.appendChild(p(c));
    return;
  }
  if (!c) {
    r && o.removeChild(r);
    return;
  }
  if (c.type !== n.type) {
    o.replaceChild(p(c), r);
    return;
  }
  const t = r;
  for (const [e, a] of Object.entries(c.props))
    e.startsWith("on") || t[e] !== a && (t[e] = a);
  for (const e of Object.keys(n.props))
    e in c.props || (t[e] = void 0);
  const i = Math.max(c.children.length, n.children.length);
  for (let e = 0; e < i; e++)
    x(t, c.children[e], n.children[e], e);
}
function E(o) {
  const c = o.tagName.toLowerCase(), n = {}, s = o.textContent;
  Array.from(o.attributes).forEach((t) => {
    n[t.name] = t.value;
  });
  const r = Array.from(o.childNodes).map((t) => {
    if (t.nodeType === Node.ELEMENT_NODE)
      return E(t);
    if (t.nodeType === Node.TEXT_NODE)
      return { type: "text", props: { value: t.textContent }, children: [] };
  }).filter(Boolean);
  return { type: c, props: n, children: r, content: s };
}
function C(o, c, n) {
  const s = n.split(".").reduce((r, t) => r[t], c);
  if (o.tagName === "INPUT") {
    const r = o;
    r.value = s, r.addEventListener("input", (t) => {
      const i = t.target.value, e = n.split("."), a = e.pop(), u = e.reduce((l, f) => l[f], c);
      u[a] = i;
    });
  } else
    o.textContent = s;
  o.setAttribute("data-bind-path", n);
}
function g(o, c) {
  const n = o.getAttribute("@click");
  if (n) {
    const s = new Function("model", `with(model) { ${n} }`);
    o.addEventListener("click", () => s(c));
  }
}
function h(o, c) {
  const n = o.textContent || "", s = n.matchAll(/\{\s*([\w.]+)\s*\}/g), r = [];
  for (const i of s) {
    const e = i[1].trim(), a = i[0];
    r.push({ path: e, placeholder: a });
  }
  function t() {
    let i = n;
    for (const { path: e, placeholder: a } of r) {
      const u = e.split(".").reduce((l, f) => l[f], c);
      i = i.replace(a, u ?? "");
    }
    o.textContent = i;
  }
  t(), d(c, (i) => {
    r.some(({ path: e }) => i.startsWith(e.split(".")[0])) && t();
  });
}
function v(o, c) {
  const n = document.querySelector(o), s = d(c, (t) => {
    y(n, s, t);
  });
  function r(t) {
    const i = t.getAttribute("x-model");
    if (i && C(t, s, i), g(t, s), t.childNodes.length === 1 && t.childNodes[0].nodeType === Node.TEXT_NODE) {
      const e = t.textContent || "";
      e.includes("{") && e.includes("}") && h(t, s);
    }
    Array.from(t.children).forEach((e) => r(e));
  }
  r(n);
}
export {
  g as bindClick,
  E as createVirtualDOM,
  v as initializeApp,
  p as render,
  x as updateElement
};
//# sourceMappingURL=index.es.js.map
