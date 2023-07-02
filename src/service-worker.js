import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);

if (!self.define) { let e, s = {}; const i = (i, n) => (i = new URL(i + ".js", n).href, s[i] || new Promise((s => { if ("document" in self) { const e = document.createElement("script"); e.src = i, e.onload = s, document.head.appendChild(e) } else e = i, importScripts(i), s() })).then((() => { let e = s[i]; if (!e) throw new Error(`Module ${i} didn’t register its module`); return e }))); self.define = (n, r) => { const o = e || ("document" in self ? document.currentScript.src : "") || location.href; if (s[o]) return; let t = {}; const c = e => i(e, o), l = { module: { uri: o }, exports: t, require: c }; s[o] = Promise.all(n.map((e => l[e] || c(e)))).then((e => (r(...e), t))) } } define(["./workbox-d6430d1c"], (function (e) { "use strict"; e.setCacheNameDetails({ prefix: "offline-notes" }), self.skipWaiting(), e.precacheAndRoute([{ url: "/css/app.b587f0da.css", revision: null }, { url: "/index.html", revision: "c5a9c1c375b62212beba39f4f239cb2b" }, { url: "/js/app.2b89c822.js", revision: null }, { url: "/js/chunk-vendors.e8861f51.js", revision: null }, { url: "/manifest.json", revision: "0eb59181877897b322fec6ad46b71b08" }, { url: "/robots.txt", revision: "b6216d61c03e6ce0c9aea6ca7808f7ca" }], {}) }));
//# sourceMappingURL=service-worker.js.map

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('offline-notes').then(cache => {
            return cache.addAll(
                [
                    '/img/icons/favicon-16x16.png',
                    '/img/icons/favicon-32x32.png',
                    '/img/icons/android-chrome-192x192.png',
                ]
            )
        })
    )
})