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

  const PAGE = 12;
  const list = document.getElementById('pick-list');
  const empty = document.getElementById('picks-empty');
  const noMatch = document.getElementById('picks-nomatch');
  const more = document.getElementById('picks-more');
  const search = document.getElementById('pick-search');
  const count = document.getElementById('pick-count');

  // accents and case don't matter when searching
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const visible = PICKS.filter((p) => p.from <= today)
    .map((p) => ({ p, text: norm([p.name, p.dev, p.blurb, ...p.tags].join(' ')) }));

  const card = (p) => {
    const c = el('article', 'card pick');

    const img = el('img', 'pick-img');
    img.src = `img/games/${p.slug}.jpg`;
    img.alt = `${p.name} key art`;
    img.loading = 'lazy';
    img.width = 460; img.height = 215;
    c.append(img);

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

    // tags double as quick searches
    const tags = el('ul', 'tags');
    p.tags.forEach((t) => {
      const li = el('li');
      const btn = el('button', 'tag', t);
      btn.type = 'button';
      btn.addEventListener('click', () => { search.value = t; shown = PAGE; render(); search.scrollIntoView({ block: 'center' }); });
      li.append(btn);
      tags.append(li);
    });
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

    c.append(body);
    return c;
  };

  let shown = PAGE;
  const render = () => {
    const q = norm(search.value.trim());
    const words = q.split(/\s+/).filter(Boolean);
    const hits = visible.filter((v) => words.every((w) => v.text.includes(w)));
    list.replaceChildren(...hits.slice(0, shown).map((v) => card(v.p)));
    empty.hidden = visible.length > 0;
    noMatch.hidden = !(visible.length > 0 && hits.length === 0);
    more.hidden = hits.length <= shown;
    count.textContent = q ? `${hits.length} of ${visible.length} picks` : `${visible.length} picks`;
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };

  search.value = new URLSearchParams(location.search).get('q') || '';
  search.addEventListener('input', () => { shown = PAGE; render(); });
  more.addEventListener('click', () => { shown += PAGE; render(); });
  document.getElementById('pick-search-wrap').hidden = visible.length === 0;
  render();

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
