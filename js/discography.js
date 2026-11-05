/* freelink – discography list (discography.html) and album page (album.html?a=<slug>)
 * Data lives in js/discography-data.js.
 */
(function () {
  'use strict';

  var ALBUMS = (window.ALBUMS || []).slice();
  var root = document.getElementById('discography');
  if (!root) return;

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

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
  function longDate(d) {                 // 2026-10-06 -> "6 October 2026"
    var p = d.split('-');
    return Number(p[2]) + ' ' + MONTHS[p[1] - 1] + ' ' + p[0];
  }
  function inline(text) {               // *italic* and [text](https://link) -> DOM nodes
    var frag = document.createDocumentFragment(), re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*([^*]+)\*/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(m[1] ? el('a', { href: m[2], target: '_blank', rel: 'noopener', text: m[1] })
                            : el('i', { text: m[3] }));
      last = re.lastIndex;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }
  function paragraphs(text, cls) {       // blank line = new paragraph
    var box = el('div', { 'class': cls });
    text.split(/\n\s*\n/).forEach(function (para) {
      if (para.trim()) { var p = el('p'); p.appendChild(inline(para.trim())); box.appendChild(p); }
    });
    return box;
  }
  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }
  function albumHref(a) { return 'album.html?a=' + encodeURIComponent(a.slug); }

  /* ---------- list: artist name, then that artist's albums with years ---------- */
  function renderList() {
    var byArtist = {}, order = [];
    ALBUMS.slice().sort(byDateDesc).forEach(function (a) {      // newest first, so artists order by latest release
      if (!byArtist[a.artist]) { byArtist[a.artist] = []; order.push(a.artist); }
      byArtist[a.artist].push(a);
    });
    root.textContent = '';
    order.forEach(function (name) {
      var ul = el('ul', { 'class': 'dg-albums' });
      byArtist[name].forEach(function (a) {
        ul.appendChild(el('li', {}, [
          el('a', { href: albumHref(a) }, [
            el('span', { 'class': 'dg-name', text: a.title }),
            el('span', { 'class': 'dg-year', text: '[' + a.date.slice(0, 4) + ']' })
          ])
        ]));
      });
      root.appendChild(el('section', { 'class': 'dg-artist' }, [el('h2', { text: name }), ul]));
    });
  }

  /* ---------- lightbox: click the cover to see it large, floating above the page ---------- */
  function openLightbox(thumb, title, opener) {
    var big = el('img', { 'class': 'dg-lb-img', src: thumb.currentSrc || thumb.src, alt: thumb.alt });
    var closeBtn = el('button', { type: 'button', 'class': 'dg-lb-close', 'aria-label': 'Close', text: '\u00d7' });
    var box = el('div', { 'class': 'dg-lb', role: 'dialog', 'aria-modal': 'true', 'aria-label': title + ' \u2013 cover' }, [big, closeBtn]);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.body.appendChild(box);
    document.documentElement.classList.add('dg-lock');

    // grow out of the thumbnail: start the big image on top of it, then let it transition to centre
    var from = thumb.getBoundingClientRect(), to = big.getBoundingClientRect();
    if (!reduce && to.width) {
      var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
      var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
      big.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (from.width / to.width) + ')';
      big.getBoundingClientRect();                      // commit the start position
    }
    box.classList.add('is-open');
    big.style.transform = '';
    closeBtn.focus();

    var closed = false;
    function close() {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey);
      box.classList.remove('is-open');
      document.documentElement.classList.remove('dg-lock');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, reduce ? 0 : 220);
      opener.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }   // keep focus inside the dialog
    }
    document.addEventListener('keydown', onKey);
    box.addEventListener('click', close);               // click anywhere (image, backdrop or the x) closes
  }

  /* ---------- album page ---------- */
  function renderAlbum() {
    var m = /[?&]a=([^&#]+)/.exec(location.search);
    var slug = m ? decodeURIComponent(m[1]) : '';
    var a = ALBUMS.filter(function (x) { return x.slug === slug; })[0];

    root.textContent = '';
    if (!a) {
      document.title = 'Album not found – freelink';
      root.appendChild(el('p', {}, [document.createTextNode('That album could not be found. '), el('a', { href: 'discography.html', text: 'See all albums' })]));
      return;
    }
    document.title = a.title + ' – ' + a.artist + ' – freelink';

    root.appendChild(el('h1', { 'class': 'dg-title', text: a.title }));
    root.appendChild(el('p', { 'class': 'dg-meta' }, [
      document.createTextNode(a.artist), el('br'), document.createTextNode('Released ' + longDate(a.date))
    ]));
    var cover = el('img', { 'class': 'dg-cover', src: a.cover, alt: 'Cover of ' + a.title + ' by ' + a.artist });
    var zoom = el('button', { type: 'button', 'class': 'dg-zoom', 'aria-label': 'Enlarge cover of ' + a.title }, [cover]);
    zoom.addEventListener('click', function () { openLightbox(cover, a.title, zoom); });
    root.appendChild(zoom);
    var links = el('div', { 'class': 'dg-links' });
    (a.links || []).forEach(function (l) {
      links.appendChild(el('a', { 'class': 'dg-btn', href: l.url, target: '_blank', rel: 'noopener', text: '> ' + l.label }));
    });
    if (a.writeup) links.appendChild(el('a', { 'class': 'dg-btn', href: a.writeup, text: '> Read the write-up' }));
    root.appendChild(links);

    if (a.about) root.appendChild(paragraphs(a.about, 'dg-about'));
    if (a.credits) {
      root.appendChild(el('h2', { 'class': 'dg-h2', text: 'Credits' }));
      root.appendChild(paragraphs(a.credits, 'dg-credits'));
    }
  }

  if (root.getAttribute('data-view') === 'album') renderAlbum(); else renderList();
})();
