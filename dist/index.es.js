const g = "@model", w = "@click", y = "@if", E = "@for";
function _(e) {
  const n = [], r = e.getAttribute(E);
  if (r) {
    const [, l] = r.split(" in ");
    return n.push({ path: l, placeholder: null }), n;
  }
  if (e.childNodes.length)
    return [];
  const c = h(e.textContent);
  if (e.nodeType === Node.TEXT_NODE)
    return c;
  const t = e.getAttribute(g);
  return t && n.push({ path: t, placeholder: t }), [...c, ...n];
}
function h(e) {
  return e ? Array.from(e.matchAll(/\{\s*([\w.]+)\s*\}/g)).map((r) => ({
    path: r[1].trim(),
    placeholder: r[0]
  })) : [];
}
function j(e) {
  return Array.from(e.childNodes).map((n) => {
    if (n.nodeType === Node.ELEMENT_NODE)
      return C(n);
    if (n.nodeType === Node.TEXT_NODE)
      return {
        type: "text",
        content: n.textContent,
        props: {},
        children: [],
        element: n,
        bindPathList: h(n.textContent),
        forConfig: null
      };
    if (n.nodeType === Node.COMMENT_NODE)
      return {
        type: "comment",
        content: n.textContent,
        props: {},
        children: [],
        element: n,
        bindPathList: h(n.textContent),
        forConfig: null
      };
  }).filter(Boolean);
}
function B(e) {
  const n = e.match(/(\w+)\s+in\s+(.+)/);
  if (!n)
    throw new Error(`Invalid @for syntax: ${e}`);
  return { item: n[1], list: n[2] };
}
function C(e) {
  const n = e.tagName.toLowerCase(), r = {}, c = e.textContent;
  Array.from(e.attributes).forEach((i) => {
    r[i.name] = i.value;
  });
  const t = r[E];
  let l = null;
  t && (l = B(t));
  const s = j(e), o = _(e);
  return e.removeAttribute(g), e.removeAttribute(y), e.removeAttribute(E), e.removeAttribute(w), {
    type: n,
    props: r,
    children: s,
    content: c,
    element: e,
    bindPathList: o,
    forConfig: l
  };
}
function v(e, n) {
  function r(c, t = []) {
    return Array.isArray(c) ? new Proxy(c, {
      get(l, s) {
        if (console.log(t), console.log(s), console.log("Tablica odczytana:", [...t, s].join(".")), typeof s == "string" && ["push", "pop", "splice", "shift", "unshift"].includes(s))
          return (...i) => {
            const u = Array.prototype[s].apply(l, i);
            return n(t.join(".")), u;
          };
        const o = l[s];
        return typeof o == "object" && o !== null ? r(o, [...t, s]) : o;
      },
      set(l, s, o) {
        return console.log("Tablica zmieniona:", [...t, s].join("."), "Nowa wartość:", o), l[s] = o, n(t.join(".")), !0;
      }
    }) : typeof c == "object" && c !== null ? new Proxy(c, {
      get(l, s) {
        const o = l[s];
        return typeof o == "object" && o !== null ? r(o, [...t, s]) : o;
      },
      set(l, s, o) {
        return console.log("Model zmieniony:", [...t, s].join("."), "Nowa wartość:", o), l[s] = o, n([...t, s].join(".")), !0;
      }
    }) : c;
  }
  return r(e);
}
function O(e, n, r, c) {
  n.children.forEach((t, l) => {
    if (t.props[y]) {
      const i = t.props[y];
      if (new Function("model", `with(model) { return ${i}; }`)(r))
        t.element.style.display = "";
      else {
        t.element.style.display = "none";
        return;
      }
    }
    if (t.children.length && O(e, t, r, c), t.props[g] === c) {
      const i = c.split(".").reduce((u, a) => u[a], r);
      if (t.element.tagName === "INPUT") {
        const u = t.element;
        u.value !== i && (u.value = i);
      } else
        t.element.textContent = i;
      return;
    }
    if (!t.bindPathList.length || !t.bindPathList.filter((i) => i.path === c).length)
      return;
    let o = t.content || "";
    t.bindPathList.filter((i) => !!i.placeholder).forEach((i) => {
      const u = i.path.split(".").reduce((a, f) => a[f], r);
      o = o.replace(i.placeholder, u ?? "");
    }), t.element.textContent = o;
  });
}
function N(e, n, r) {
  const c = r.split(".").reduce((t, l) => t[l], n);
  if (e.tagName === "INPUT") {
    const t = e;
    t.value = c, t.addEventListener("input", (l) => {
      const s = l.target.value, o = r.split("."), i = o.pop(), u = o.reduce((a, f) => a[f], n);
      u[i] = s;
    });
  } else
    e.textContent = c;
}
function R(e, n, r) {
  const c = n.props[w];
  if (c) {
    const t = new Function("model", `with(model) { ${c} }`);
    e.addEventListener("click", () => t(r));
  }
}
function A(e, n) {
  const { content: r, props: c, element: t, bindPathList: l, forConfig: s } = e;
  if (!s) {
    if (r && r.includes("{") && r.includes("}") && t.nodeType === Node.TEXT_NODE) {
      const o = () => {
        let i = r;
        l.filter((u) => !!u.placeholder).forEach(({ path: u, placeholder: a }) => {
          const f = u.split(".").reduce((b, m) => b[m], n);
          i = i.replace(a, f ?? "");
        }), t.textContent = i;
      };
      o(), l.forEach(({ path: i }) => {
        v(n, (u) => {
          u.startsWith(i.split(".")[0]) && o();
        });
      });
    }
    e.children.forEach((o) => {
      typeof o == "object" && A(o, n);
    });
  }
}
function I(e) {
  const { container: n, data: r } = e, c = typeof n == "string" ? document.querySelector(n) : n, t = C(c);
  console.log(t);
  const l = v(r, (o) => {
    O(c, t, l, o);
  });
  function s(o, i, u) {
    var m;
    const { props: a, element: f, forConfig: b } = o;
    if (a[y]) {
      const p = a[y];
      if (new Function("model", `with(model) { return ${p}; }`)(u))
        f.style.display = "";
      else {
        f.style.display = "none";
        return;
      }
    }
    if (b) {
      const { item: p, list: x } = b, L = new Function("model", `with(model) { return ${x}; }`)(u);
      f.style.display = "none";
      const T = document.createDocumentFragment();
      L.forEach((M) => {
        const D = { [p]: M }, d = f.cloneNode(!0);
        d.removeAttribute("@for"), d.style.display = "";
        const F = C(d);
        s(F, d, D), T.appendChild(d);
      }), (m = i.parentNode) == null || m.replaceChild(T, f);
      return;
    }
    a[g] && N(i, l, a[g]), a[w] && R(i, o, l), A(o, u), o.children.forEach((p, x) => {
      if (typeof p == "object") {
        const P = i.childNodes[x];
        s(p, P, u);
      }
    });
  }
  s(t, c, r);
}
export {
  I as initializeAppWithVirtualDOM
};
//# sourceMappingURL=index.es.js.map
