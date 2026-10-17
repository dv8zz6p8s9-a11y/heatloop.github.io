/* HeatLoop daily totals: no cookies, identifiers, browser storage, URLs or project data. */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script || navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const endpoint = new URL('/api/metrics', script.src).href;
  const kind = script.dataset.event;
  if (!['landing_view', 'app_open'].includes(kind)) return;
  let opened = false;
  function send(event) {
    try { Promise.resolve(fetch(endpoint, {method:'POST', mode:'cors', credentials:'omit', keepalive:true, referrerPolicy:'no-referrer', headers:{'Content-Type':'text/plain;charset=UTF-8'}, body:JSON.stringify({event})})).catch(() => {}); } catch {}
  }
  function start() {
    if (opened || document.visibilityState !== 'visible') return;
    if (kind === 'app_open' && document.documentElement.dataset.heatloopReady !== 'true') return;
    opened = true;
    send(kind);
  }
  if (kind === 'landing_view') document.addEventListener('click', event => {
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor || event.defaultPrevented) return;
    const target = new URL(anchor.href, location.href);
    if (target.origin === 'https://dv8zz6p8s9-a11y.github.io' && /^\/heatloop\.github\.io\/heatloop-b\/(?:index\.html)?$/.test(target.pathname)) send('app_click');
  });
  window.addEventListener('load', start, {once:true});
  document.addEventListener('visibilitychange', start);
  document.addEventListener('heatloop:ready', start, {once:true});
  if (document.readyState === 'complete') start();
})();
