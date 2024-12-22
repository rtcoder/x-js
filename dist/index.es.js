const d = "@model", x = "@click", g = "@if";
function h(n) {
  const e = y(n.textContent);
  if (n.nodeType === Node.TEXT_NODE)
    return e;
  const o = [], s = n.getAttribute(d);
  return s && o.push({ path: s, placeholder: s }), [...e, ...o];
}
function y(n) {
  return n ? Array.from(n.matchAll(/\{\s*([\w.]+)\s*\}/g)).map((o) => ({
    path: o[1].trim(),
    placeholder: o[0]
  })) : [];
}
function m(n) {
  return Array.from(n.childNodes).map((e) => {
    if (e.nodeType === Node.ELEMENT_NODE)
      return E(e);
    if (e.nodeType === Node.TEXT_NODE)
      return {
        type: "text",
        content: e.textContent,
        props: {},
        children: [],
        element: e,
        bindPathList: y(e.textContent)
      };
    if (e.nodeType === Node.COMMENT_NODE)
      return {
        type: "comment",
        content: e.textContent,
        props: {},
        children: [],
        element: e,
        bindPathList: y(e.textContent)
      };
  }).filter(Boolean);
}
function E(n) {
  const e = n.tagName.toLowerCase(), o = {}, s = n.textContent;
  Array.from(n.attributes).forEach((r) => {
    o[r.name] = r.value;
  });
  const t = m(n), l = n.childNodes.length ? [] : h(n);
  return { type: e, props: o, children: t, content: s, element: n, bindPathList: l };
}
function T(n, e) {
  function o(s, t = []) {
    return new Proxy(s, {
      get(l, r) {
        const i = l[r];
        return typeof i == "object" && i !== null ? o(i, [...t, r]) : i;
      },
      set(l, r, i) {
        return console.log("Model changed at:", [...t, r].join("."), "New value:", i), l[r] = i, e([...t, r].join(".")), !0;
      }
    });
  }
  return o(n);
}
function P(n, e, o, s) {
  e.children.forEach((t, l) => {
    if (t.props[g]) {
      const c = t.props[g];
      if (new Function("model", `with(model) { return ${c}; }`)(o))
        t.element.style.display = "";
      else {
        t.element.style.display = "none";
        return;
      }
    }
    if (t.children.length && P(n, t, o, s), t.props[d] === s) {
      const c = s.split(".").reduce((u, f) => u[f], o);
      if (t.element.tagName === "INPUT") {
        const u = t.element;
        u.value !== c && (u.value = c);
      } else
        t.element.textContent = c;
      return;
    }
    if (!t.bindPathList.length || !t.bindPathList.filter((c) => c.path === s).length)
      return;
    let i = t.content || "";
    t.bindPathList.forEach((c) => {
      const u = c.path.split(".").reduce((f, a) => f[a], o);
      i = i.replace(c.placeholder, u ?? "");
    }), t.element.textContent = i;
  });
}
function O(n, e, o) {
  const s = o.split(".").reduce((t, l) => t[l], e);
  if (n.tagName === "INPUT") {
    const t = n;
    t.value = s, t.addEventListener("input", (l) => {
      const r = l.target.value, i = o.split("."), c = i.pop(), u = i.reduce((f, a) => f[a], e);
      u[c] = r;
    });
  } else
    console.log({ target: s }), n.textContent = s;
}
function L(n, e) {
  const o = n.getAttribute(x);
  if (o) {
    const s = new Function("model", `with(model) { ${o} }`);
    n.addEventListener("click", () => s(e));
  }
}
function C(n, e) {
  const { content: o, props: s, element: t, bindPathList: l } = n;
  if (console.log("element", t), o && o.includes("{") && o.includes("}") && t.nodeType === Node.TEXT_NODE) {
    const r = () => {
      let i = o;
      l.forEach(({ path: c, placeholder: u }) => {
        const f = c.split(".").reduce((a, p) => a[p], e);
        i = i.replace(u, f ?? "");
      }), t.textContent = i;
    };
    r(), l.forEach(({ path: i }) => {
      T(e, (c) => {
        c.startsWith(i.split(".")[0]) && r();
      });
    });
  }
  n.children.forEach((r) => {
    typeof r == "object" && C(r, e);
  });
}
function M(n) {
  const { container: e, data: o } = n, s = typeof e == "string" ? document.querySelector(e) : e, t = E(s);
  console.log(t);
  const l = T(o, (i) => {
    P(s, t, l, i);
  });
  function r(i, c) {
    const { props: u, element: f } = i;
    if (u[g]) {
      const a = u[g];
      if (new Function("model", `with(model) { return ${a}; }`)(o))
        f.style.display = "";
      else {
        f.style.display = "none";
        return;
      }
    }
    u[d] && O(c, l, u[d]), u[x] && L(c, l), C(i, l), i.children.forEach((a, p) => {
      if (typeof a == "object") {
        console.log(c);
        const b = c.childNodes[p];
        console.log(b, a), r(a, b);
      }
    });
  }
  r(t, s);
}
export {
  M as initializeAppWithVirtualDOM
};
//# sourceMappingURL=index.es.js.map
