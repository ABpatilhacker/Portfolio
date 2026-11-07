(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const profile = window.portfolioProfile || {};
  const safeUrl = (value) => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
  const text = (tag, value, className) => { const element = document.createElement(tag); element.textContent = value; if (className) element.className = className; return element; };

  if (profile.name) {
    $$('[data-profile="name"]').forEach(el => el.textContent = profile.name);
    document.title = `${profile.name} — ${profile.role || 'Personal portfolio'}`;
    $('.hero-portrait img').alt = `${profile.name}, wearing a blue denim shirt in soft natural light`;
    $('.about-image img').alt = `Portrait of ${profile.name}`;
    $('meta[name="description"]').content = `${profile.name}${profile.role ? ' — ' + profile.role : ''}. A personal portfolio of work, interests, and creative exploration.`;
  }
  if (profile.shortName) $('[data-profile="shortName"]').textContent = `Hello, I’m ${profile.shortName}.`;
  if (profile.role) $('.hero-eyebrow [data-profile]').textContent = profile.role;
  if (profile.intro) $('.hero-description').textContent = profile.intro;
  if (profile.about?.length) $('#about-content').replaceChildren(...profile.about.map(p => text('p', p)));
  if (profile.skills?.length) $('#skill-list').replaceChildren(...profile.skills.map(skill => text('span', skill, 'skill')));
  if (profile.contactDescription) $('#contact-description').textContent = profile.contactDescription;
  if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    $('#email-link').href = `mailto:${profile.email}`;
    $('#email-link').hidden = false;
    $('#copy-email').hidden = false;
    $('#contact-pending').hidden = true;
    $('#plain-email').href = `mailto:${profile.email}`; $('#plain-email').textContent = profile.email; $('#plain-email').hidden = false;
    $('#copy-email').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(profile.email); $('#copy-status').textContent = 'Email address copied.'; $('#copy-email').textContent = 'Email copied ✓'; }
      catch { $('#copy-status').textContent = `Email address: ${profile.email}`; $('#copy-email').textContent = profile.email; }
    });
  }
  for (const social of profile.socials || []) {
    const href = safeUrl(social.url);
    if (!href) continue;
    const a = text('a', `${social.label} ↗`); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `${social.label} (opens in a new tab)`); $('#social-links').append(a);
  }
  $('#year').textContent = new Date().getFullYear();

  const menu = $('.menu-toggle'); const nav = $('#navigation');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!$('.site-header').contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  const smallScreen = matchMedia('(max-width:700px)'); smallScreen.addEventListener('change', closeMenu);

  const projects = new Map();
  if (profile.projects?.length) {
    $('#project-grid').replaceChildren();
    $('#demo-note').textContent = 'Project covers are editorial illustrations. Open a project for the story, my role, and the tools behind the work.';
    $('#work-note').textContent = 'Selected work / 01 — 04';
    $('#work-intro').textContent = 'Applications, live business websites, and the work that keeps them growing.';
    profile.projects.forEach((project, index) => {
      const id = `personal-${index}`; projects.set(id, project);
      const card = text('button', '', `project-card reveal${index % 2 ? ' project-offset' : ''}`); card.dataset.project = id; card.dataset.cursor = 'view'; card.setAttribute('aria-haspopup', 'dialog');
      const art = text('div', '', `project-art project-cover cover-${project.visual || 'default'}`);
      const coverTop = text('div', '', 'cover-top'); coverTop.append(text('span', project.category || 'Selected project'), text('span', String(index + 1).padStart(2, '0')));
      const mark = text('div', '', 'cover-mark'); mark.setAttribute('aria-hidden', 'true');
      const artName = project.visual === 'mercury' ? 'Mercury' : project.visual === 'avenya' ? 'avenya' : project.visual === 'attendance' ? 'Present.' : project.title;
      const coverBody = text('div', '', 'cover-body'); coverBody.append(text('span', artName, 'cover-name'), text('span', project.tagline || '', 'cover-tagline'));
      const coverFooter = text('div', '', 'cover-footer'); coverFooter.append(text('span', project.status || 'Project'), text('span', '↗', 'cover-icon'));
      art.append(coverTop, mark, coverBody, coverFooter);
      const meta = text('div', '', 'project-meta'); const copy = text('div', ''); copy.append(text('h3', project.title), text('p', project.category || 'Personal project')); meta.append(copy, text('span', '↗', 'project-arrow')); card.append(art, meta); $('#project-grid').append(card);
    });
  }

  const dialog = $('#project-dialog'); let priorFocus;
  const closeDialog = () => dialog.close();
  $('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); priorFocus?.focus({ preventScroll: true }); });
  const openProject = (id, trigger) => {
    const demo = $('#dialog-demo'); const details = $('#dialog-details'); demo.replaceChildren(); details.replaceChildren();
    $('#dialog-eyebrow').textContent = projects.has(id) ? 'Selected project' : 'Interactive study / Portfolio demo';
    if (id === 'form') {
      $('#dialog-title').textContent = 'Form & feeling';
      $('#dialog-description').textContent = 'A small exploration of colour, shape, and balance. Choose a palette and see how a single accent changes the mood.';
      const canvas = text('div', '', 'demo-canvas'); const shape = text('div', '', 'demo-shape'); canvas.append(shape, text('div', '', 'demo-orb')); const controls = text('div', '', 'demo-controls'); controls.append(text('span', 'Choose a colour'));
      [['Terracotta', '#9d3c27'], ['Olive', '#687250'], ['Ink blue', '#35475a']].forEach(([label, color], index) => { const button = text('button', '', 'swatch'); button.style.setProperty('--swatch', color); button.setAttribute('aria-label', label); button.setAttribute('aria-pressed', String(index === 0)); button.addEventListener('click', () => { shape.style.borderColor = color; $$('.swatch', controls).forEach(el => el.setAttribute('aria-pressed', String(el === button))); }); controls.append(button); }); demo.append(canvas, controls);
    } else if (id === 'type') {
      $('#dialog-title').textContent = 'A play on type';
      $('#dialog-description').textContent = 'A few words can change the whole composition. Add your own, then switch the contrast to find a different feeling.';
      const preview = text('div', 'Make it meaningful.', 'type-preview'); const label = text('label', 'Your words', 'demo-input'); const input = document.createElement('input'); input.type = 'text'; input.maxLength = 60; input.value = 'Make it meaningful.'; input.addEventListener('input', () => preview.textContent = input.value || 'Your words here.'); label.append(input);
      const toggle = text('button', 'Switch contrast', 'contrast-toggle'); toggle.setAttribute('aria-pressed', 'false'); toggle.addEventListener('click', () => { const dark = toggle.getAttribute('aria-pressed') !== 'true'; toggle.setAttribute('aria-pressed', String(dark)); preview.style.background = dark ? '#262b24' : '#9d3c27'; preview.style.color = dark ? '#e2cfaa' : '#f4f0e7'; }); demo.append(preview, label, toggle);
    } else {
      const project = projects.get(id); if (!project) return;
      $('#dialog-title').textContent = project.title; $('#dialog-description').textContent = project.description || '';
      if (project.status) $('#dialog-eyebrow').textContent = `${project.category} / ${project.status}`;
      for (const paragraph of project.details || []) details.append(text('p', paragraph, 'project-details'));
      if (project.stack?.length) { const stack = text('div', '', 'skill-list'); stack.setAttribute('aria-label', 'Project tools and skills'); stack.append(...project.stack.map(item => text('span', item, 'skill'))); details.append(stack); }
      const href = safeUrl(project.url); if (href) { const link = text('a', 'Visit project ↗', 'project-live-link'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; details.append(link); }
    }
    priorFocus = trigger; dialog.showModal(); document.body.classList.add('dialog-open');
  };
  $('#project-grid').addEventListener('click', e => { const card = e.target.closest('[data-project]'); if (card) openProject(card.dataset.project, card); });

  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  let observer;
  const setMotion = () => {
    document.documentElement.classList.toggle('motion-enabled', !reducedMotion.matches);
    observer?.disconnect();
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold: .08 });
      $$('.reveal').forEach(el => observer.observe(el));
    } else $$('.reveal').forEach(el => el.classList.add('revealed'));
  }; setMotion(); reducedMotion.addEventListener('change', setMotion);

  const cursor = $('.cursor'); const finePointer = matchMedia('(hover:hover) and (pointer:fine)'); let x = -100, y = -100, currentX = x, currentY = y, frame = null;
  const updateCursor = () => { currentX += (x - currentX) * .17; currentY += (y - currentY) * .17; cursor.style.transform = `translate(${currentX - cursor.offsetWidth / 2}px,${currentY - cursor.offsetHeight / 2}px)`; if (Math.abs(x - currentX) + Math.abs(y - currentY) > .1) frame = requestAnimationFrame(updateCursor); else frame = null; };
  document.addEventListener('pointermove', e => {
    if (!finePointer.matches || reducedMotion.matches || e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY; if (currentX === -100) { currentX = x; currentY = y; } cursor.style.opacity = '1';
    const target = e.target.closest('[data-cursor],a,button'); cursor.classList.toggle('is-project', target?.dataset.cursor === 'view'); cursor.classList.toggle('is-portrait', target?.dataset.cursor === 'portrait'); cursor.classList.toggle('is-link', !!target && !target.dataset.cursor);
    if (!frame) frame = requestAnimationFrame(updateCursor);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => cursor.style.opacity = '0');
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cursor.style.opacity = '0'; if (frame) cancelAnimationFrame(frame); frame = null; } });
  let scrollQueued = false;
  const progress = () => { const scrollable = document.documentElement.scrollHeight - innerHeight; $('.reading-progress').style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`; scrollQueued = false; };
  addEventListener('scroll', () => { if (!scrollQueued) { requestAnimationFrame(progress); scrollQueued = true; } }, { passive: true }); addEventListener('resize', progress); progress();
})();
