/* freelink – expandable sections.  Works with styles/accordion.css (see the markup note there). */
document.addEventListener('click', function (e) {
  var toggle = e.target.closest && e.target.closest('.acc-toggle');
  if (!toggle) return;
  var panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;

  // Keep the speed steady whatever the height: a short section takes about a second,
  // a very tall one longer, so the moving edge is always easy to follow.
  var inner = panel.firstElementChild;
  if (inner) {
    var seconds = Math.min(3, Math.max(1, inner.scrollHeight / 3000));   // ~3000px per second, between 1s and 3s
    panel.style.setProperty('--acc-time', seconds.toFixed(2) + 's');
  }

  var open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  panel.classList.toggle('is-open', open);
});
