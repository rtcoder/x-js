function p(i, s) {
  function c(r, o = []) {
    return new Proxy(r, {
      get(t, n) {
        const e = t[n];
        return typeof e == "object" && e !== null ? c(e, [...o, n]) : e;
      },
      set(t, n, e) {
        return t[n] = e, s([...o, n].join(".")), !0;
      }
    });
  }
  return c(i);
}
function h(i, s, c) {
  i.querySelectorAll(`[data-bind-path="${c}"]`).forEach((o) => {
    if (o.tagName === "INPUT") {
      const t = o, n = c.split(".").reduce((e, u) => e[u], s);
      t.value !== n && (t.value = n);
    } else {
      const t = o.textContent || "";
      t.includes("{") && t.includes("}") ? f(o, s) : o.textContent = c.split(".").reduce((n, e) => n[e], s);
    }
  });
}
function x(i, s, c) {
  const r = c.split(".").reduce((o, t) => o[t], s);
  if (i.tagName === "INPUT") {
    const o = i;
    o.value = r, o.addEventListener("input", (t) => {
      const n = t.target.value, e = c.split("."), u = e.pop(), a = e.reduce((d, l) => d[l], s);
      a[u] = n;
    });
  } else
    i.textContent = r;
  i.setAttribute("data-bind-path", c);
}
function b(i, s) {
  const c = i.getAttribute("@click");
  if (c) {
    const r = new Function("model", `with(model) { ${c} }`);
    i.addEventListener("click", () => r(s));
  }
}
function f(i, s) {
  const c = i.textContent || "", r = c.matchAll(/\{\s*([\w.]+)\s*\}/g), o = [];
  for (const n of r) {
    const e = n[1].trim(), u = n[0];
    o.push({ path: e, placeholder: u });
  }
  function t() {
    let n = c;
    for (const { path: e, placeholder: u } of o) {
      const a = e.split(".").reduce((d, l) => d[l], s);
      n = n.replace(u, a ?? "");
    }
    i.textContent = n;
  }
  t(), o.forEach(({ path: n }) => {
    i.setAttribute("data-bind-path", n);
  });
}
function g(i, s) {
  const c = document.querySelector(i), r = p(s, (t) => {
    h(c, r, t);
  });
  function o(t) {
    const n = t.getAttribute("x-model");
    if (n && x(t, r, n), b(t, r), t.childNodes.length === 1 && t.childNodes[0].nodeType === Node.TEXT_NODE) {
      const e = t.textContent || "";
      e.includes("{") && e.includes("}") && f(t, r);
    }
    Array.from(t.children).forEach((e) => o(e));
  }
  o(c);
}
export {
  g as initializeApp
};
//# sourceMappingURL=index.es.js.map
