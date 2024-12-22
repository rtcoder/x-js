function d(n) {
  return n ? Array.from(n.matchAll(/\{\s*([\w.]+)\s*\}/g)).map((r) => ({
    path: r[1].trim(),
    placeholder: r[0]
  })) : [];
}
function y(n) {
  return Array.from(n.childNodes).map((i) => {
    if (i.nodeType === Node.ELEMENT_NODE)
      return g(i);
    if (i.nodeType === Node.TEXT_NODE)
      return {
        type: "text",
        content: i.textContent,
        props: {},
        children: [],
        element: i,
        bindPathList: d(i.textContent)
      };
  }).filter(Boolean);
}
function g(n) {
  const i = n.tagName.toLowerCase(), r = {}, o = n.textContent;
  Array.from(n.attributes).forEach((t) => {
    r[t.name] = t.value;
  });
  const a = y(n), e = n.childNodes.length ? [] : d(o);
  return { type: i, props: r, children: a, content: o, element: n, bindPathList: e };
}
function h(n, i) {
  function r(o, a = []) {
    return new Proxy(o, {
      get(e, t) {
        const c = e[t];
        return typeof c == "object" && c !== null ? r(c, [...a, t]) : c;
      },
      set(e, t, c) {
        return console.log("Model changed at:", [...a, t].join("."), "New value:", c), e[t] = c, i([...a, t].join(".")), !0;
      }
    });
  }
  return r(n);
}
function b(n, i, r, o) {
  i.children.forEach((e, t) => {
    if (e.children.length && b(n, e, r, o), !e.bindPathList.length || !e.bindPathList.filter((u) => u.path === o).length)
      return;
    let s = e.content || "";
    e.bindPathList.forEach((u) => {
      const l = u.path.split(".").reduce((f, p) => f[p], r);
      s = s.replace(u.placeholder, l ?? "");
    }), e.element.textContent = s;
  }), n.querySelectorAll(`[data-bind-path="${o}"]`).forEach((e) => {
    if (e.tagName === "INPUT") {
      const t = e, c = o.split(".").reduce((s, u) => s[u], r);
      t.value !== c && (t.value = c);
    } else {
      const t = o.split(".").reduce((s, u) => s[u], r), c = e.getAttribute("data-original-text") || e.textContent || "";
      e.textContent = c.replace(`{${o}}`, t ?? "");
    }
  });
}
function T(n, i, r) {
  const o = r.split(".").reduce((a, e) => a[e], i);
  if (n.tagName === "INPUT") {
    const a = n;
    a.value = o, a.addEventListener("input", (e) => {
      const t = e.target.value, c = r.split("."), s = c.pop(), u = c.reduce((l, f) => l[f], i);
      u[s] = t;
    });
  } else
    n.textContent = o;
  n.setAttribute("data-bind-path", r);
}
function C(n, i) {
  const r = n.getAttribute("@click");
  if (r) {
    const o = new Function("model", `with(model) { ${r} }`);
    n.addEventListener("click", () => o(i));
  }
}
function x(n, i, r) {
  const { content: o, props: a, element: e } = n;
  if (console.log("element", e), o && o.includes("{") && o.includes("}") && e.nodeType === Node.TEXT_NODE) {
    const t = d(o), c = () => {
      let s = o;
      t.forEach(({ path: u, placeholder: l }) => {
        const f = u.split(".").reduce((p, E) => p[E], i);
        s = s.replace(l, f ?? "");
      }), e.textContent = s;
    };
    c(), t.forEach(({ path: s }) => {
      h(i, (u) => {
        u.startsWith(s.split(".")[0]) && c();
      });
    });
  }
  n.children.forEach((t) => {
    typeof t == "object" && x(t, i);
  });
}
function v(n, i) {
  const r = document.querySelector(n), o = g(r);
  console.log(o);
  const a = h(i, (t) => {
    b(r, o, a, t);
  });
  function e(t, c) {
    t.props["x-model"] && T(c, a, t.props["x-model"]), t.props["@click"] && C(c, a), x(t, a), t.children.forEach((s, u) => {
      if (typeof s == "object") {
        const l = c.childNodes[u];
        e(s, l);
      }
    });
  }
  e(o, r);
}
export {
  v as initializeAppWithVirtualDOM
};
//# sourceMappingURL=index.es.js.map
