function E(n, o) {
  return (t, e) => {
    o.has(t) || o.set(t, []), o.get(t).push(e), e.type === "checkbox" ? e.checked = n[t] : e.type === "radio" ? e.checked = e.value === n[t] : e.value = n[t], e.addEventListener("input", () => {
      e.type === "checkbox" ? n[t] = e.checked : e.type === "radio" ? e.checked && (n[t] = e.value) : n[t] = e.value;
    }), e.tagName === "SELECT" && e.addEventListener("change", () => {
      n[t] = e.value;
    });
  };
}
function g(n, o) {
  return o.split(".").reduce((t, e) => t && t[e], n);
}
function b(n, o, t) {
  const e = o.split(".");
  let r = n;
  for (let i = 0; i < e.length - 1; i++)
    r = r[e[i]];
  const s = e[e.length - 1];
  r && (r[s] = t, n[s] = t), l(n);
}
function l(n) {
  document.querySelectorAll("*").forEach((o) => {
    o.tagName !== "SCRIPT" && o.childNodes.length === 1 && o.childNodes[0].nodeType === Node.TEXT_NODE && n.bindText(o);
  });
}
function C(n, o) {
  return (t) => {
    const e = t.getAttribute("x-model");
    e ? t.dataset.originalContent = `{${e}}` : t.dataset.originalContent || (t.dataset.originalContent = t.textContent);
    const r = t.dataset.originalContent, s = r.match(/{\s*[\w.]+\s*}/g);
    if (s) {
      const i = () => {
        t.textContent = r.replace(/{\s*([\w.]+)\s*}/g, (f, a) => g(n, a.trim()) || "");
      };
      s.forEach((f) => {
        const a = f.replace(/[{}]/g, "").trim();
        o.has(a) || o.set(a, []), o.get(a).push(i);
      }), i();
    }
  };
}
function N(n) {
  const o = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), e = {
    get(s, i) {
      return Reflect.get(s, i);
    },
    set(s, i, f) {
      const a = Reflect.set(s, i, f);
      if (o.has(i) && o.get(i).forEach((c) => {
        c.type === "checkbox" ? c.checked = f : c.type === "radio" ? c.checked = c.value === f : c.value = f;
      }), t.has(i) && t.get(i).forEach((c) => c()), i.includes(".")) {
        const c = i.split(".");
        let d = s;
        for (let u = 0; u < c.length - 1; u++)
          d = d[c[u]];
        const h = c[c.length - 1];
        d && d.hasOwnProperty(h) && (d[h] = f);
      }
      return a;
    }
  }, r = new Proxy(n, e);
  return r.bind = E(r, o), r.bindText = C(r, t), r;
}
function T(n, o) {
  n.querySelectorAll("[x-for]").forEach((t) => {
    const e = t.getAttribute("x-for"), [r, s] = e.split(" in ").map((a) => a.trim()), i = document.createComment(`x-for="${e}"`);
    t.parentNode.insertBefore(i, t), t.parentNode.removeChild(t), (() => {
      const a = o[s] || [];
      let c = i.nextSibling;
      for (; c && c.nodeType !== Node.COMMENT_NODE; ) {
        const d = c;
        c = d.nextSibling, d.remove();
      }
      a.forEach((d) => {
        var p;
        const h = N({ [r]: d }), u = t.cloneNode(!0);
        u.removeAttribute("x-for"), (p = i.parentNode) == null || p.appendChild(u), x(h, i.parentNode);
      });
    })();
  });
}
function v(n, o) {
  n.querySelectorAll("[x-if]").forEach((t) => {
    const e = t.getAttribute("x-if"), r = document.createComment(`x-if="${e}"`);
    t.parentNode.insertBefore(r, t), t.parentNode.removeChild(t);
    const s = () => {
      var i;
      o[e] ? t.parentNode || (i = r.parentNode) == null || i.insertBefore(t, r.nextSibling) : t.parentNode && t.parentNode.removeChild(t);
    };
    s(), Object.defineProperty(o, e, {
      get: function() {
        return this[`_${e}`];
      },
      set: function(i) {
        this[`_${e}`] = i, s();
      }
    });
  });
}
function x(n, o = document) {
  v(o, n), T(o, n), o.querySelectorAll("[x-model]").forEach((t) => {
    const e = t.getAttribute("x-model"), r = g(n, e);
    t.tagName === "INPUT" || t.tagName === "TEXTAREA" ? t.value = r || "" : t.textContent = r || "", t.addEventListener("input", (s) => {
      const i = s.target.value;
      b(n, e, i);
    });
  }), l(n);
}
function A(n) {
  const o = N(n);
  x(o);
}
export {
  A as appX
};
//# sourceMappingURL=index.es.js.map
