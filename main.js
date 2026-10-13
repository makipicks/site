// Renders the picks list and makes Maki's eyes follow the pointer.
(function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // ?today=YYYY-MM-DD previews the list on another day
  const today = new URLSearchParams(location.search).get('today') || new Date().toISOString().slice(0, 10);

  const steamUrl = (p) =>
    `https://store.steampowered.com/app/${p.appId}/${p.steamSlug}/?utm_source=makipicks&utm_medium=shorts&utm_campaign=${p.slug}`;

  const status = (p) => {
    if (!p.release) return 'Coming soon';
    if (p.release <= today) return 'Out now';
    const [, m, d] = p.release.split('-').map(Number);
    return `Out ${MONTHS[m - 1]} ${d}`;
  };

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const list = document.getElementById('pick-list');
  const visible = PICKS.filter((p) => p.from <= today);
  document.getElementById('picks-empty').hidden = visible.length > 0;

  visible.forEach((p) => {
    const card = el('article', 'card pick');

    const img = el('img', 'pick-img');
    img.src = `img/games/${p.slug}.jpg`;
    img.alt = `${p.name} key art`;
    img.loading = 'lazy';
    img.width = 460; img.height = 215;
    card.append(img);

    const body = el('div', 'pick-body');
    const top = el('div', 'pick-top');
    top.append(el('span', 'badge', status(p)));
    if (p.own) {
      const b = el('span', 'badge badge-own', "Made by Maki Picks' creator");
      b.title = 'Full disclosure: this game is made by the creator of Maki Picks.';
      top.append(b);
    }
    if (p.friend) top.append(el('span', 'badge badge-own', 'Made by a friend'));
    body.append(top);

    body.append(el('h3', 'pick-name', p.name));
    body.append(el('p', 'pick-dev', `by ${p.dev}`));
    body.append(el('p', 'pick-blurb', p.blurb));

    const tags = el('ul', 'tags');
    p.tags.forEach((t) => tags.append(el('li', null, t)));
    body.append(tags);

    const actions = el('div', 'pick-actions');
    const steam = el('a', 'pill pill-ink', 'Wishlist on Steam');
    steam.href = steamUrl(p); steam.target = '_blank'; steam.rel = 'noopener';
    actions.append(steam);
    if (p.short) {
      const watch = el('a', 'pill', 'Watch the short');
      watch.href = p.short; watch.target = '_blank'; watch.rel = 'noopener';
      actions.append(watch);
    }
    body.append(actions);

    card.append(body);
    list.append(card);
  });

  // sample short: no autoplay for reduced motion
  const sample = document.querySelector('.phone video');
  if (sample && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sample.removeAttribute('autoplay'); sample.pause(); sample.controls = true;
  }

  // eyes follow the pointer (a little)
  const cat = document.querySelector('.cat');
  const pupils = document.querySelector('.cat .pupils');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cat && pupils && !still) {
    window.addEventListener('pointermove', (e) => {
      const r = cat.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, len / 400);
      pupils.setAttribute('transform', `translate(${(dx / len) * 26 * k} ${(dy / len) * 10 * k})`);
    }, { passive: true });
  }
})();
