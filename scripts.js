/* ═══════════════════════════════════════════
   DATA LOADING & RENDERING ENGINE
═══════════════════════════════════════════ */

// ── Helpers ──
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

function statusClass(s) {
  if (s === 'current') return 'current';
  if (s === 'highlight') return 'highlight';
  return '';
}

function renderTags(tags) {
  return tags.map(t => `<span class="tl-tag">${t}</span>`).join('');
}

function renderBullets(arr) {
  if (!arr || !arr.length) return '';
  return '<ul class="tl-bullets">' + arr.map(b => `<li>${b}</li>`).join('') + '</ul>';
}

/* ── Modal helpers ── */
function closeModal(id) { $(id).classList.remove('open'); }
function closeModalOutside(e) {
  if (e.target.classList.contains('modal-back')) e.target.classList.remove('open');
}
document.querySelectorAll('.modal-back').forEach(m => m.addEventListener('click', closeModalOutside));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-back.open').forEach(m => m.classList.remove('open'));
});

/* ═══════════════════════════════════════════
   FETCH ALL JSON FILES
═══════════════════════════════════════════ */
async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function init() {
  const [edu, exp, vol, projects, misc, travel, golf] = await Promise.all([
    loadJSON('data/education.json'),
    loadJSON('data/experience.json'),
    loadJSON('data/volunteer.json'),
    loadJSON('data/projects.json'),
    loadJSON('data/misc.json'),
    loadJSON('data/travel.json'),
    loadJSON('data/golf.json'),
  ]);

  renderEducation(edu);
  renderExperience(exp);
  renderVolunteer(vol);
  renderProjects(projects);
  renderAwards(misc.awards);
  renderCerts(misc.certifications);
  renderCourses(misc.courses);
  renderSkills(misc.skills);
  renderLanguages(misc.languages);
  renderTravel(travel);
  renderGolf(golf);
  initReveal();
}

/* ═══════════════════════════════════════════
   SECTION RENDERERS
═══════════════════════════════════════════ */

/* ── Education ── */
function renderEducation(data) {
  const tl = $('edu-timeline');
  data.forEach(item => {
    const d = el('div', `tl-item ${statusClass(item.status)}`);
    d.innerHTML = `
      <div class="tl-org">${item.school}</div>
      <div class="tl-role">${item.degree}</div>
      <div class="tl-period">${item.period}</div>
      ${item.location ? `<div class="tl-note">${item.location}</div>` : ''}
      ${renderBullets(item.highlights)}
      ${item.tags.length ? `<div class="tl-tags">${renderTags(item.tags)}</div>` : ''}
      ${item.badge ? `<div class="tl-badge">${item.badge}</div>` : ''}
    `;
    tl.appendChild(d);
  });
}

/* ── Experience ── */
function renderExperience(data) {
  const tl = $('exp-timeline');
  data.forEach(item => {
    const d = el('div', `tl-item ${statusClass(item.status)}`);
    let rolesHTML = '';
    if (item.roles.length === 1) {
      const r = item.roles[0];
      rolesHTML = `
        <div class="tl-role">${r.title}</div>
        <div class="tl-period">${r.period}</div>
        ${renderBullets(r.highlights)}
        ${r.tags.length ? `<div class="tl-tags">${renderTags(r.tags)}</div>` : ''}
      `;
    } else {
      rolesHTML = '<div class="role-nest">';
      item.roles.forEach(r => {
        rolesHTML += `
          <div class="role-nest-item">
            <div class="role-title">${r.title}</div>
            <div class="tl-period">${r.period}</div>
            ${renderBullets(r.highlights)}
            ${r.tags.length ? `<div class="tl-tags">${renderTags(r.tags)}</div>` : ''}
          </div>`;
      });
      rolesHTML += '</div>';
    }
    d.innerHTML = `
      <div class="tl-org">${item.org}</div>
      ${item.location ? `<div class="tl-note">${item.location}</div>` : ''}
      ${rolesHTML}
    `;
    tl.appendChild(d);
  });
}

/* ── Volunteer ── */
function renderVolunteer(data) {
  const tl = $('vol-timeline');
  data.forEach(item => {
    const d = el('div', `tl-item ${statusClass(item.status)}`);
    d.innerHTML = `
      <div class="tl-org">${item.org}</div>
      <div class="tl-role">${item.role}</div>
      <div class="tl-period">${item.period}</div>
      ${item.location ? `<div class="tl-note">${item.location}</div>` : ''}
      ${renderBullets(item.highlights)}
      ${item.tags.length ? `<div class="tl-tags">${renderTags(item.tags)}</div>` : ''}
    `;
    tl.appendChild(d);
  });
}

/* ── Projects ── */
function renderProjects(data) {
  const grid = $('project-grid');
  data.forEach(p => {
    const c = el('div', 'card project-card');
    c.innerHTML = `
      <div class="card-tape"></div>
      <div class="p-emoji">${p.emoji}</div>
      <div class="p-title">${p.title}</div>
      <div class="p-period">${p.period} · ${p.association}</div>
      <div class="p-desc">${p.summary}</div>
      <div class="p-stack">${p.stack.map(s => `<span>${s}</span>`).join('')}</div>
      <div class="p-link">→ View details</div>
    `;
    c.addEventListener('click', () => openProject(p));
    grid.appendChild(c);
  });

  // Add button
  const btn = el('button', 'add-btn');
  btn.innerHTML = `<span style="font-size:2.3rem">＋</span><span>Add New Project</span><span style="font-size:0.75rem;color:#aaa;margin-top:4px;">Edit data/projects.json</span>`;
  btn.onclick = () => alert('To add a project:\n\nOpen data/projects.json and add a new object to the array.\nMatch the existing format:\n{\n  "emoji": "🔥",\n  "title": "My Project",\n  "period": "Jan 2026 – Now",\n  "association": "University of Toronto",\n  "summary": "Short description...",\n  "description": "Long detailed description...",\n  "stack": ["Python", "React"],\n  "tags": ["AI", "Web"],\n  "github": "https://github.com/..."\n}');
  grid.appendChild(btn);
}

function openProject(p) {
  $('pm-emoji').textContent  = p.emoji;
  $('pm-title').textContent  = p.title;
  $('pm-period').textContent = p.period;
  $('pm-assoc').textContent  = p.association;
  $('pm-desc').textContent   = p.description;
  $('pm-stack').textContent  = p.stack.join(', ');
  $('pm-tags').textContent   = p.tags.join(' · ');
  const lw = $('pm-link-wrap');
  if (p.github) { $('pm-link').href = p.github; lw.style.display = 'block'; }
  else { lw.style.display = 'none'; }
  $('projModal').classList.add('open');
}

/* ── Awards ── */
function renderAwards(data) {
  const grid = $('awards-grid');
  data.forEach((a, i) => {
    const c = el('div', `card award-card color-${a.color}`);
    if (i % 2 === 0) c.innerHTML += '<div class="card-tape"></div>';
    c.innerHTML += `
      <div class="award-title">${a.title}</div>
      <div class="award-issuer">${a.issuer}</div>
      <div class="award-year">${a.year}</div>
    `;
    grid.appendChild(c);
  });
}

/* ── Certs ── */
function renderCerts(data) {
  const grid = $('cert-grid');
  data.forEach((c, i) => {
    const card = el('div', `card cert-card color-${c.color}`);
    if (i % 2 === 0) card.innerHTML += '<div class="card-tape"></div>';
    card.innerHTML += `
      <div class="cert-name">${c.name}</div>
      <div class="cert-issuer">${c.issuer}</div>
      <div class="cert-date">${c.date}</div>
      <div class="cert-id">ID: ${c.credentialId}</div>
      <div class="tl-tags" style="margin-top:10px;">${renderTags(c.tags)}</div>
    `;
    grid.appendChild(card);
  });
}

/* ── Courses ── */
function renderCourses(data) {
  const tabsEl   = $('course-tabs');
  const panelsEl = $('course-panels');
  const icons    = { 'Computer Science':'💻','Mathematics':'📐','Finance & Accounting':'💰','Management':'🏢','Law & Legal Tech':'⚖️','Other':'🌐' };
  const bgColors = ['color-green','color-yellow','color-pink','color-lav','color-yellow','color-white'];
  const keys = Object.keys(data);

  keys.forEach((key, i) => {
    const id = 'cp-' + key.replace(/\W+/g, '-');
    const icon = icons[key] || '📖';

    // tab button
    const tab = el('button', `ctab${i === 0 ? ' active' : ''}`);
    tab.textContent = `${icon} ${key}`;
    tab.dataset.panel = id;
    tab.onclick = function() {
      document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cpanel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      $(id).classList.add('active');
    };
    tabsEl.appendChild(tab);

    // panel
    const panel = el('div', `cpanel${i === 0 ? ' active' : ''}`, '');
    panel.id = id;
    const pgrid = el('div', 'cpanel-grid');
    data[key].forEach(course => {
      const ci = el('div', `citem ${bgColors[i]}`);
      ci.innerHTML = `
        <div class="citem-name">${course.name}</div>
        <div class="citem-code">${course.code}</div>
        <div class="citem-school">${course.school}</div>
      `;
      pgrid.appendChild(ci);
    });
    panel.appendChild(pgrid);
    panelsEl.appendChild(panel);
  });
}

/* ── Skills ── */
function renderSkills(data) {
  const container = $('skills-container');
  Object.entries(data).forEach(([group, skills]) => {
    const g = el('div', 'skills-group');
    g.innerHTML = `<h3>${group}</h3>`;
    const chips = el('div', 'skill-chips');
    skills.forEach(s => {
      const chip = el('span', 'skill-chip', s);
      chips.appendChild(chip);
    });
    g.appendChild(chips);
    container.appendChild(g);
  });
}

/* ── Languages ── */
function renderLanguages(data) {
  const grid = $('lang-grid');
  const rots = ['-1.5deg', '1deg', '-0.8deg'];
  const bgs  = ['white', 'var(--yellow)', 'white'];
  data.forEach((lang, i) => {
    const c = el('div', 'lang-card');
    c.style.transform = `rotate(${rots[i % rots.length]})`;
    c.style.background = bgs[i % bgs.length];
    const dots = Array.from({length: 5}, (_, j) =>
      `<div class="ldot${j < lang.dots ? ' on' : ''}"></div>`
    ).join('');
    c.innerHTML = `
      <div class="lang-name">${lang.name}</div>
      <div class="lang-level">${lang.level}</div>
      <div class="lang-dots">${dots}</div>
    `;
    grid.appendChild(c);
  });
}

/* ═══════════════════════════════════════════
   TRAVEL CANVAS
═══════════════════════════════════════════ */
function renderTravel(data) {
  const canvas = $('canvasInner');
  const canvasWrap = $('travelCanvas');
  const W = canvasWrap.offsetWidth  || 800;
  const H = canvasWrap.offsetHeight || 520;

  // Scatter positions (seeded-ish, avoid label area at top)
  const positions = [
    { x: 0.12, y: 0.22 }, { x: 0.35, y: 0.55 }, { x: 0.60, y: 0.20 },
    { x: 0.75, y: 0.60 }, { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.42 },
    { x: 0.85, y: 0.30 },
  ];

  data.forEach((country, i) => {
    const pos = positions[i % positions.length];
    const pin = el('div', 'flag-pin');
    pin.style.left   = `${pos.x * 100}%`;
    pin.style.top    = `${pos.y * 100}%`;
    pin.style.animation = `fl${i % 7} ${3.5 + (i * 0.7) % 2}s ease-in-out infinite`;
    pin.style.animationDelay = `${(i * 0.4) % 2}s`;

    pin.innerHTML = `
      <div class="pin-body">
        <div class="pin-emoji">${country.flag}</div>
        <div class="pin-label">${country.country}</div>
      </div>
      <div class="pin-stem"></div>
      <div class="pin-dot"></div>
    `;
    pin.addEventListener('click', () => openTravel(country));
    canvas.appendChild(pin);
  });

  // Drag to pan
  let dragging = false, startX, startY;
  let offsetX = 0, offsetY = 0, dragOffsetX = 0, dragOffsetY = 0;

  canvasWrap.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    dragOffsetX = offsetX; dragOffsetY = offsetY;
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    offsetX = dragOffsetX + (e.clientX - startX);
    offsetY = dragOffsetY + (e.clientY - startY);
    // Clamp so pins stay visible
    offsetX = Math.max(-200, Math.min(200, offsetX));
    offsetY = Math.max(-100, Math.min(100, offsetY));
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  // Touch drag
  canvasWrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    dragOffsetX = offsetX; dragOffsetY = offsetY;
  });
  canvasWrap.addEventListener('touchmove', e => {
    e.preventDefault();
    offsetX = dragOffsetX + (e.touches[0].clientX - startX);
    offsetY = dragOffsetY + (e.touches[0].clientY - startY);
    offsetX = Math.max(-200, Math.min(200, offsetX));
    offsetY = Math.max(-100, Math.min(100, offsetY));
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }, { passive: false });
}

function openTravel(country) {
  $('tm-flag').textContent    = country.flag;
  $('tm-country').textContent = country.country;
  $('tm-years').textContent   = country.years;
  $('tm-journal').textContent = country.journal;

  const hlList = $('tm-highlights');
  hlList.innerHTML = country.highlights.map(h => `<span class="travel-hl-item">${h}</span>`).join('');

  const imgGrid = $('tm-img-grid');
  imgGrid.innerHTML = '';
  if (country.images && country.images.length > 0) {
    country.images.forEach(src => {
      const slot = el('div', 'travel-img-slot');
      slot.innerHTML = `<img src="${src}" alt="${country.country}">`;
      imgGrid.appendChild(slot);
    });
    $('tm-imgs-wrap').style.display = 'block';
  } else {
    // Show placeholder slots
    imgGrid.innerHTML = `
      <div class="travel-img-slot">📷 Add photo URLs to travel.json</div>
    `;
    $('tm-imgs-wrap').style.display = 'block';
  }

  $('travelModal').classList.add('open');
}

/* ── Golf ── */
function renderGolf(data) {
  $('golf-handicap').textContent = data.handicap;

  const statsEl = $('golf-stats');
  const statsData = [
    { val: data.stats.totalRounds, label: 'Total Rounds', bg: 'var(--green)' },
    { val: data.stats.bestScore,   label: 'Best Score',   bg: 'var(--yellow)' },
    { val: data.stats.avgScore,    label: 'Avg Score',    bg: 'white' },
    { val: data.stats.bestCourse,  label: 'Favorite Course', bg: 'var(--pink)' },
  ];
  statsData.forEach(s => {
    const c = el('div', 'gs');
    c.style.background = s.bg;
    c.innerHTML = `<div class="gs-num">${s.val}</div><div class="gs-label">${s.label}</div>`;
    statsEl.appendChild(c);
  });

  const tbody = $('golf-tbody');
  data.rounds.forEach(r => {
    const tr = el('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.course}</td><td>${r.score}</td><td>${r.parDiff}</td><td>${r.notes}</td>`;
    tbody.appendChild(tr);
  });
}

/* ── Reveal ── */
function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.07 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Boot ── */
init().catch(err => {
  console.error('Failed to load data:', err);
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:#ff4d4d;color:white;padding:12px 24px;font-family:monospace;font-size:0.85rem;">
      ⚠️ Could not load JSON data. Make sure you're serving this via a local server (e.g. <code>python3 -m http.server</code>), not opening the file directly.
    </div>`
  );
});
