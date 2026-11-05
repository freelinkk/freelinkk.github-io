/* freelink – mobile navigation
 * Works together with styles/mobile.css. Plain JS, no jQuery needed.
 */
(function () {
  'use strict';

  var MOBILE = window.matchMedia('(max-width: 820px)');
  var ME = document.currentScript;
  var BASE = ME && ME.src ? ME.src : location.href;
  var root = document.documentElement;

  /* ---------- tiny helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  var path = location.pathname.toLowerCase().replace(/\/index\.html$/, '/');
  var navPath = path === '/album.html' ? '/discography.html' : path;   // album pages belong to discography

  /* ---------- menu content (read from the shared desktop nav so it never drifts) ---------- */
  var FALLBACK_MENU = [
    [['works', '/installation.html'], ['sound design', 'https://www.itsnova.com/jason687', 1], ['discography', '/discography.html']],
    [['mixes', '/mix.html'], ['visual', '/visual.html']],
    [['instagram', 'https://www.instagram.com/freelink0000/', 1], ['soundcloud', 'https://soundcloud.com/freelin_k', 1],
     ['contact', 'mailto:jasonandrewclark1@gmail.com']]
  ];

  function parseMenu(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var groups = [[]];
    [].forEach.call(doc.querySelectorAll('nav a, nav br'), function (n) {
      if (n.tagName === 'BR') { if (groups[groups.length - 1].length) groups.push([]); return; }
      var href = n.getAttribute('href'), text = n.textContent.trim();
      if (!href || !text || n.getAttribute('value') === 'freelink') return;   // brand is in the bar
      groups[groups.length - 1].push([text, href, n.getAttribute('target') ? 1 : 0]);
    });
    return groups.filter(function (g) { return g.length; });
  }

  function renderMenu(listHost, groups) {
    listHost.textContent = '';
    groups.forEach(function (g, i) {
      var ul = el('ul', { 'class': 'fl-menu-list' });
      g.forEach(function (item) {
        var a = el('a', { href: item[1], text: item[0] });
        if (item[2]) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
        try {
          var u = new URL(item[1], location.href);
          if (u.origin === location.origin && u.pathname.toLowerCase() === navPath) a.setAttribute('aria-current', 'page');
        } catch (e) {}
        ul.appendChild(el('li', {}, [a]));
      });
      listHost.appendChild(ul);
      if (i < groups.length - 1) listHost.appendChild(el('div', { 'class': 'fl-menu-gap' }));
    });
  }


  /* ---------- SoundCloud: same embeds, minus artwork/comments/related ---------- */
  function enhanceSoundcloud() {
    [].forEach.call(document.querySelectorAll('iframe[src*="w.soundcloud.com/player"]'), function (f) {
      var u = f.getAttribute('src').replace(/&amp;/g, '&');
      ['auto_play=false', 'hide_related=true', 'show_comments=false', 'show_teaser=false', 'show_reposts=false',
       'show_user=false', 'show_artwork=false', 'visual=false'].forEach(function (kv) {
        var k = kv.split('=')[0];
        u = u.replace(new RegExp('([?&])' + k + '=[^&]*&?', 'g'), '$1').replace(/[?&]$/, '');
        u += (u.indexOf('?') < 0 ? '?' : '&') + kv;
      });
      f.setAttribute('src', u);
      f.setAttribute('height', '166');
    });

    // the pages separate mixes with literal "---" text; not needed on phones
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), t, dead = [];
    while ((t = w.nextNode())) if (/^\s*-{3,}\s*$/.test(t.nodeValue)) dead.push(t);
    dead.forEach(function (x) { x.parentNode.removeChild(x); });
  }

  /* ---------- build the mobile UI (once, the first time the screen is narrow) ---------- */
  var built = false;
  var bar, menuBtn, menuPanel, menuOpen = false;

  function closeMenu(returnFocus) {
    menuPanel.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
    root.classList.remove('fl-lock');
    menuOpen = false;
    if (returnFocus) menuBtn.focus();
  }
  function toggleMenu() {
    if (menuOpen) { closeMenu(true); return; }
    menuPanel.style.top = bar.offsetHeight + 'px';
    menuPanel.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.textContent = 'Close';
    root.classList.add('fl-lock');
    menuOpen = true;
    menuPanel.focus();
  }

  function build() {
    // title fix: most pages are still titled "Document"
    if (!document.title || document.title.toLowerCase() === 'document') {
      var h = document.querySelector('.row [style*="font-size: 20px"], .row b');
      var t = h && h.textContent.trim();
      document.title = (t ? t + ' – ' : '') + 'freelink';
    }

    // main landmark = first column that isn't navigation and has something in it
    var cols = [].slice.call(document.querySelectorAll('.row > [class*="col-"]'));
    var main = cols.filter(function (c) {
      return !c.querySelector('#nav-placeholder, #navworks-placeholder') &&
             (c.textContent.trim().length || c.querySelector('img, iframe'));
    })[0];
    if (main) { main.id = main.id || 'fl-main'; main.setAttribute('role', 'main'); main.setAttribute('tabindex', '-1'); }

    enhanceSoundcloud();

    // section list (works / visual / mixes): collapsible, open on the hub pages
    var sec = document.getElementById('navworks-placeholder'), toggle = null;
    if (sec) {
      var label = /works|installation/.test(path) ? 'Works' : /visual/.test(path) ? 'Visual' : /mix/.test(path) ? 'Mixes' : 'Pages';
      var hub = /^\/(installation|mix|visual)(\.html)?\/?$/.test(path);
      sec.id = sec.id || 'navworks-placeholder';
      toggle = el('button', { type: 'button', 'class': 'fl-section-toggle', 'aria-controls': sec.id, text: 'All ' + label.toLowerCase() });
      var setOpen = function (open) {
        toggle.setAttribute('aria-expanded', String(open));
        sec.classList.toggle('fl-collapsed', !open);
      };
      toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
      sec.parentNode.insertBefore(toggle, sec);
      setOpen(hub);
      // mark the current page for assistive tech once the fragment has loaded
      new MutationObserver(function () {
        [].forEach.call(sec.querySelectorAll('a[href]'), function (a) {
          if (a.textContent.trim() && a.pathname.toLowerCase() === path) a.setAttribute('aria-current', 'page');
        });
      }).observe(sec, { childList: true, subtree: true });
    }

    // top bar
    var skip = el('a', { 'class': 'fl-skip', href: '#' + ((main && main.id) || 'fl-main'), text: 'Skip to content' });
    if (!main && toggle) skip.setAttribute('href', '#navworks-placeholder');
    var brand = el('a', { 'class': 'fl-brand', href: '/', text: 'freelink' });
    if (path === '/') brand.setAttribute('aria-current', 'page');
    menuBtn = el('button', { type: 'button', 'class': 'fl-btn', 'aria-expanded': 'false', 'aria-controls': 'fl-menu', text: 'Menu' });
    bar = el('header', { 'class': 'fl-bar' }, [brand, el('div', { 'class': 'fl-bar-actions' }, [menuBtn])]);

    menuPanel = el('nav', { 'class': 'fl-panel', id: 'fl-menu', hidden: '', tabindex: '-1', 'aria-label': 'Main' });
    renderMenu(menuPanel, FALLBACK_MENU);
    fetch(new URL('../pages/navbar/navmain.html', BASE).href)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (html) { var g = parseMenu(html); if (g.length) renderMenu(menuPanel, g); })
      .catch(function () {});

    menuBtn.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
    menuPanel.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) closeMenu(false); });

    var body = document.body;
    body.insertBefore(menuPanel, body.firstChild);
    body.insertBefore(bar, body.firstChild);
    body.insertBefore(skip, body.firstChild);
  }

  function ensure() {
    if (!built && MOBILE.matches && document.body) { built = true; build(); }
    if (built && !MOBILE.matches && menuOpen) closeMenu(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else ensure();
  if (MOBILE.addEventListener) MOBILE.addEventListener('change', ensure);
  else if (MOBILE.addListener) MOBILE.addListener(ensure);
})();
