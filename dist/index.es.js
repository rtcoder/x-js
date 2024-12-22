function E(t) {
  const e = p(t.textContent);
  if (t.nodeType === Node.TEXT_NODE)
    return e;
  const o = [], i = t.getAttribute("x-model");
  return i && o.push({ path: i, placeholder: i }), [...e, ...o];
}
function p(t) {
  return t ? Array.from(t.matchAll(/\{\s*([\w.]+)\s*\}/g)).map((o) => ({
    path: o[1].trim(),
    placeholder: o[0]
  })) : [];
}
function T(t) {
  return Array.from(t.childNodes).map((e) => {
    if (e.nodeType === Node.ELEMENT_NODE)
      return d(e);
    if (e.nodeType === Node.TEXT_NODE)
      return {
        type: "text",
        content: e.textContent,
        props: {},
        children: [],
        element: e,
        bindPathList: p(e.textContent)
      };
  }).filter(Boolean);
}
function d(t) {
  const e = t.tagName.toLowerCase(), o = {}, i = t.textContent;
  Array.from(t.attributes).forEach((c) => {
    o[c.name] = c.value;
  });
  const n = T(t), s = t.childNodes.length ? [] : E(t);
  return { type: e, props: o, children: n, content: i, element: t, bindPathList: s };
}
function g(t, e) {
  function o(i, n = []) {
    return new Proxy(i, {
      get(s, c) {
        const r = s[c];
        return typeof r == "object" && r !== null ? o(r, [...n, c]) : r;
      },
      set(s, c, r) {
        return console.log("Model changed at:", [...n, c].join("."), "New value:", r), s[c] = r, e([...n, c].join(".")), !0;
      }
    });
  }
  return o(t);
}
function x(t, e, o, i) {
  e.children.forEach((n, s) => {
    if (n.children.length && x(t, n, o, i), n.props["x-model"] === i) {
      const a = i.split(".").reduce((u, l) => u[l], o);
      if (n.element.tagName === "INPUT") {
        const u = n.element;
        u.value !== a && (u.value = a);
      } else
        n.element.textContent = a;
      return;
    }
    if (!n.bindPathList.length || !n.bindPathList.filter((a) => a.path === i).length)
      return;
    let r = n.content || "";
    n.bindPathList.forEach((a) => {
      const u = a.path.split(".").reduce((l, f) => l[f], o);
      r = r.replace(a.placeholder, u ?? "");
    }), n.element.textContent = r;
  });
}
function y(t, e, o) {
  const i = o.split(".").reduce((n, s) => n[s], e);
  if (t.tagName === "INPUT") {
    const n = t;
    n.value = i, n.addEventListener("input", (s) => {
      const c = s.target.value, r = o.split("."), a = r.pop(), u = r.reduce((l, f) => l[f], e);
      u[a] = c;
    });
  } else
    console.log({ target: i }), t.textContent = i;
  t.setAttribute("data-bind-path", o);
}
function C(t, e) {
  const o = t.getAttribute("@click");
  if (o) {
    const i = new Function("model", `with(model) { ${o} }`);
    t.addEventListener("click", () => i(e));
  }
}
function h(t, e) {
  const { content: o, props: i, element: n, bindPathList: s } = t;
  if (console.log("element", n), o && o.includes("{") && o.includes("}") && n.nodeType === Node.TEXT_NODE) {
    const c = () => {
      let r = o;
      s.forEach(({ path: a, placeholder: u }) => {
        const l = a.split(".").reduce((f, b) => f[b], e);
        r = r.replace(u, l ?? "");
      }), n.textContent = r;
    };
    c(), s.forEach(({ path: r }) => {
      g(e, (a) => {
        a.startsWith(r.split(".")[0]) && c();
      });
    });
  }
  t.children.forEach((c) => {
    typeof c == "object" && h(c, e);
  });
}
function L(t) {
  const { container: e, data: o } = t, i = typeof e == "string" ? document.querySelector(e) : e, n = d(i);
  console.log(n);
  const s = g(o, (r) => {
    x(i, n, s, r);
  });
  function c(r, a) {
    r.props["x-model"] && y(a, s, r.props["x-model"]), r.props["@click"] && C(a, s), h(r, s), r.children.forEach((u, l) => {
      if (typeof u == "object") {
        const f = a.childNodes[l];
        c(u, f);
      }
    });
  }
  c(n, i);
}
export {
  L as initializeAppWithVirtualDOM
};
//# sourceMappingURL=index.es.js.map
