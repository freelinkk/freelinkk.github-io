/* freelink – mix archive (search / filter / sort / play)
 * Data lives in js/mixes-data.js.  Renders into #mixes-archive on mix.html.
 */
(function () {
  'use strict';

  var MIXES = (window.MIXES || []).slice();
  var root = document.getElementById('mixes-archive');
  if (!root) return;

  var TYPES = [['all', 'All'], ['club', 'Club'], ['radio', 'Radio'], ['mixtape', 'Mixtapes']];
  var TYPE_LABEL = { club: 'Club', radio: 'Radio', mixtape: 'Mixtape' };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var COLS = [['title', 'Name'], ['artist', 'Artist / alias'], ['type', 'Type'], ['location', 'Location'], ['date', 'Date']];

  var state = { q: '', type: 'all', loc: '', artist: '', sort: 'date', dir: 'desc' };
  var open = null;          // the mix whose player is showing
  var orderKey = '';        // last applied sort (re-ordering reloads players, so only when it changes)

  /* ---------- helpers ---------- */
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
  function norm(s) {
    s = String(s || '').toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }
  function fmtDate(d) {
    if (!d) return '';
    var p = d.split('-');
    if (/^Q[1-4]$/i.test(p[1] || '')) return p[1].toUpperCase() + ' ' + p[0];     // 2019-Q4 -> "Q4 2019"
    if (p.length === 3) return Number(p[2]) + ' ' + MONTHS[p[1] - 1] + ' ' + p[0];
    if (p.length === 2) return MONTHS[p[1] - 1] + ' ' + p[0];
    return p[0];
  }
  function sortKey(m, k) {
    if (k === 'date') {
      var p = (m.date || '').split('-');
      if (!m.date) return '';
      var mo = /^Q[1-4]$/i.test(p[1] || '') ? ('0' + ((p[1].charAt(1) - 1) * 3 + 1)).slice(-2) : (p[1] || '00');   // quarter -> its first month
      return p[0] + '-' + mo + '-' + (p[2] || '00');
    }
    if (k === 'type') return TYPE_LABEL[m.type] || '';
    return norm(m[k]);
  }
  function haystack(m) {
    return norm([m.title, m.artist, TYPE_LABEL[m.type], m.type, m.location, fmtDate(m.date), m.date].join(' '));
  }
  function matches(m) {
    if (state.type !== 'all' && m.type !== state.type) return false;
    if (state.loc && m.location !== state.loc) return false;
    if (state.artist && m.artist !== state.artist) return false;
    var words = norm(state.q).split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) if (m._hay.indexOf(words[i]) < 0) return false;
    return true;
  }
  function compare(a, b) {
    var va = sortKey(a, state.sort), vb = sortKey(b, state.sort);
    if (!va && vb) return 1;             // blanks always last, whichever direction
    if (va && !vb) return -1;
    var r = va < vb ? -1 : va > vb ? 1 : 0;
    if (r !== 0) return state.dir === 'asc' ? r : -r;
    return a.title.localeCompare(b.title);
  }

  /* ---------- players ---------- */
  function scSrc(url) {
    return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) +
      '&color=%23e07d59&auto_play=false&hide_related=true&show_comments=false&show_teaser=false' +
      '&show_reposts=false&show_user=false&show_artwork=false&visual=false';
  }
  function fillPlayers(m, box) {
    if (m.description) {
      var d = el('div', { 'class': 'mx-desc' });
      m.description.split(/\n\s*\n/).forEach(function (para) { d.appendChild(el('p', { text: para.trim() })); });
      box.appendChild(d);
    }
    (m.youtube || []).forEach(function (id) {
      box.appendChild(el('iframe', { 'class': 'mx-yt', src: 'https://www.youtube.com/embed/' + id,
        title: m.title + ' (video)', allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen',
        allowfullscreen: '', frameborder: '0', referrerpolicy: 'strict-origin-when-cross-origin' }));
    });
    (m.mixcloud || []).forEach(function (path) {
      box.appendChild(el('iframe', { 'class': 'mx-mc', title: m.title + ' (audio)', width: '100%', height: '120',
        src: 'https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&light=1&hide_tracklist=1&feed=' + encodeURIComponent(path),
        frameborder: '0', allow: 'autoplay' }));
    });
    (m.soundcloud || []).forEach(function (url) {
      box.appendChild(el('iframe', { 'class': 'mx-sc', src: scSrc(url), title: m.title + ' (audio)',
        width: '100%', height: '166', scrolling: 'no', frameborder: 'no', allow: 'autoplay' }));
    });
  }
  function setOpen(m, on) {
    m._btn.setAttribute('aria-expanded', String(on));
    m._row.classList.toggle('is-open', on);
    m._mark.textContent = on ? '−' : '+';
    m._detail.hidden = !on;
    m._box.textContent = '';                    // removing the iframes stops playback
    if (on) fillPlayers(m, m._box);
  }
  function toggle(m) {
    var wasOpen = open === m;
    if (open) { setOpen(open, false); open = null; }
    if (!wasOpen) { setOpen(m, true); open = m; }
  }

  /* ---------- build ---------- */
  var tbody, count, empty, searchInput, sortSelect, locSelect, artistSelect, chipBtns = [], thBtns = {}, ths = {};

  MIXES.forEach(function (m) { m._hay = haystack(m); });

  function buildRows() {
    MIXES.forEach(function (m) {
      var mark = el('span', { 'class': 'mx-mark', 'aria-hidden': 'true', text: '+' });
      var btn = el('button', { type: 'button', 'class': 'mx-name', 'aria-expanded': 'false' },
        [mark, el('span', { text: m.title })]);
      var box = el('div', { 'class': 'mx-players' });
      var detail = el('tr', { 'class': 'mx-detail', hidden: '' },
        [el('td', { colspan: '5' }, [box])]);
      var row = el('tr', { 'class': 'mx-row' }, [
        el('td', { 'class': 'mx-c-name' }, [btn]),
        el('td', { 'class': 'mx-c-artist' + (m.artist ? '' : ' is-blank'), text: m.artist || '\u2014' }),
        el('td', { 'class': 'mx-c-type', text: TYPE_LABEL[m.type] || '' }),
        el('td', { 'class': 'mx-c-loc' + (m.location ? '' : ' is-blank'), text: m.location || '—' }),
        el('td', { 'class': 'mx-c-date' + (m.date ? '' : ' is-blank'), text: fmtDate(m.date) || '—' })
      ]);
      btn.addEventListener('click', function () { toggle(m); });
      m._row = row; m._detail = detail; m._btn = btn; m._mark = mark; m._box = box;
    });
  }

  function build() {
    // search
    searchInput = el('input', { type: 'search', 'class': 'mx-search', placeholder: 'Search name, place, year…',
      'aria-label': 'Search mixes', autocomplete: 'off' });
    searchInput.addEventListener('input', function () { state.q = searchInput.value; update(); });

    // type chips
    var chips = el('div', { 'class': 'mx-chips', role: 'group', 'aria-label': 'Type of mix' });
    TYPES.forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'mx-chip', text: t[1], 'aria-pressed': 'false' });
      b.addEventListener('click', function () { state.type = t[0]; update(); });
      chipBtns.push([b, t[0]]); chips.appendChild(b);
    });

    // artist / alias and location filters
    function uniqueSelect(field, allLabel, label) {
      var seen = {};
      MIXES.forEach(function (m) { if (m[field]) seen[m[field]] = 1; });
      var sel = el('select', { 'class': 'mx-select', 'aria-label': label },
        [el('option', { value: '', text: allLabel })].concat(
          Object.keys(seen).sort(function (a, b) { return a.localeCompare(b); })
            .map(function (v) { return el('option', { value: v, text: v }); })));
      sel.addEventListener('change', function () { state[field === 'artist' ? 'artist' : 'loc'] = sel.value; update(); });
      return sel;
    }
    artistSelect = uniqueSelect('artist', 'All artists / aliases', 'Filter by artist or alias');
    locSelect = uniqueSelect('location', 'All locations', 'Filter by location');

    // sort select (always usable; the column headings do the same on wide screens)
    sortSelect = el('select', { 'class': 'mx-select mx-sort-select', 'aria-label': 'Sort mixes' });
    [['date', 'desc', 'Date – newest first'], ['date', 'asc', 'Date – oldest first'],
     ['title', 'asc', 'Name A–Z'], ['title', 'desc', 'Name Z–A'],
     ['artist', 'asc', 'Artist A–Z'], ['artist', 'desc', 'Artist Z–A'],
     ['location', 'asc', 'Location A–Z'], ['location', 'desc', 'Location Z–A'],
     ['type', 'asc', 'Type A–Z'], ['type', 'desc', 'Type Z–A']].forEach(function (o) {
      sortSelect.appendChild(el('option', { value: o[0] + ':' + o[1], text: o[2] }));
    });
    sortSelect.addEventListener('change', function () {
      var p = sortSelect.value.split(':'); state.sort = p[0]; state.dir = p[1]; update();
    });

    count = el('p', { 'class': 'mx-count', 'aria-live': 'polite' });

    var tools = el('div', { 'class': 'mx-tools' }, [searchInput, chips, artistSelect, locSelect, sortSelect]);

    // table
    var headRow = el('tr');
    COLS.forEach(function (c) {
      var b = el('button', { type: 'button', 'class': 'mx-sort' }, [el('span', { text: c[1] }), el('span', { 'class': 'mx-arrow', 'aria-hidden': 'true' })]);
      b.addEventListener('click', function () {
        if (state.sort === c[0]) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
        else { state.sort = c[0]; state.dir = c[0] === 'date' ? 'desc' : 'asc'; }
        update();
      });
      var th = el('th', { scope: 'col', 'aria-sort': 'none' }, [b]);
      thBtns[c[0]] = b; ths[c[0]] = th; headRow.appendChild(th);
    });
    tbody = el('tbody');
    buildRows();
    var table = el('table', { 'class': 'mx-table' }, [el('caption', { 'class': 'mx-sr', text: 'Mix archive' }),
      el('thead', {}, [headRow]), tbody]);

    var clear = el('button', { type: 'button', 'class': 'mx-link', text: 'Clear search and filters' });
    clear.addEventListener('click', function () {
      state.q = ''; state.type = 'all'; state.loc = ''; state.artist = ''; searchInput.value = ''; locSelect.value = ''; artistSelect.value = ''; update();
    });
    empty = el('p', { 'class': 'mx-empty', hidden: '' }, [document.createTextNode('No mixes match. '), clear]);

    root.textContent = '';
    root.appendChild(tools); root.appendChild(count); root.appendChild(table); root.appendChild(empty);
  }

  /* ---------- update (filter, sort, labels) ---------- */
  function update() {
    // re-order only when the sort changed (moving a row would reload its player)
    var key = state.sort + ':' + state.dir;
    if (key !== orderKey) {
      if (open) { setOpen(open, false); open = null; }
      MIXES.slice().sort(compare).forEach(function (m) { tbody.appendChild(m._row); tbody.appendChild(m._detail); });
      orderKey = key;
    }

    var shown = 0;
    MIXES.forEach(function (m) {
      var ok = matches(m);
      m._row.hidden = !ok;
      if (!ok && open === m) { setOpen(m, false); open = null; }
      if (!ok) m._detail.hidden = true;
      else if (open === m) m._detail.hidden = false;
      if (ok) shown++;
    });

    count.textContent = shown === MIXES.length ? MIXES.length + ' mixes'
      : shown + ' of ' + MIXES.length + ' mixes';
    empty.hidden = shown !== 0;

    chipBtns.forEach(function (c) { c[0].setAttribute('aria-pressed', String(state.type === c[1])); });
    sortSelect.value = key;
    COLS.forEach(function (c) {
      var on = state.sort === c[0];
      ths[c[0]].setAttribute('aria-sort', on ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      thBtns[c[0]].lastChild.textContent = on ? (state.dir === 'asc' ? '↑' : '↓') : '';
    });
  }

  /* ---------- go ---------- */
  build();
  var qs = /[?&]type=(club|radio|mixtape)/.exec(location.search);   // old-style deep link: mix.html?type=radio
  if (qs) state.type = qs[1];
  update();
})();
