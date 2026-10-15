const cfg = window.SITE_CONFIG || {};
document.querySelectorAll('[data-brand]').forEach(el => {el.textContent = cfg.brand || 'HeatDraft';});
document.title = `${cfg.brand || 'HeatDraft'} — projektowanie instalacji grzewczych`;
const email = document.getElementById('email');
if(email && cfg.contactEmail) email.href = `mailto:${cfg.contactEmail}`;
document.getElementById('year').textContent = new Date().getFullYear();