// Shared building blocks for the frame pages: icon symbols, small HTML helpers and mount().
// Each page defines its frames and calls mount(frames); the URL hash picks which one shows.

document.write(`<svg width="0" height="0" style="position:absolute"><defs>
  <symbol id="sprout" viewBox="0 0 200 200">
    <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M101 176 V136 C101 124 103 112 107 104"/>
      <path d="M101 136 C100 130 99 127 96 124"/>
      <path d="M96 124 C78 131 57 129 45 115 C33 101 29 84 29 70 C48 70 70 74 84 86 C96 96 99 110 96 124 Z"/>
      <path d="M48 86 C66 94 82 106 92 120"/>
      <path d="M107 104 C102 84 109 61 129 48 C145 38 163 36 177 36 C179 57 173 79 157 93 C141 105 121 108 107 104 Z"/>
      <path d="M161 50 C139 63 120 82 109 102"/>
    </g>
  </symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></g></symbol>
  <symbol id="i-user-x" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7 1.7 0 3.2.6 4.4 1.5"/><path d="m17 15 5 5m0-5-5 5"/></g></symbol>
  <symbol id="i-cloud-off" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M8 7.5A5.5 5.5 0 0 1 17.6 10H18a4 4 0 0 1 2.3 7.3M16 19H7a5 5 0 0 1-1.7-9.7"/></g></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" d="M12 20.5s-8-4.6-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 6-8 10.6-8 10.6Z"/></symbol>
  <symbol id="i-file" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></g></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m8 12.4 2.7 2.6L16 9.6"/></g></symbol>
  <symbol id="i-timer" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M10 2.5h4M18.5 6.5 20 5"/></g></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></g></symbol>
  <symbol id="i-wave" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/></g></symbol>
  <symbol id="i-trophy" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/></g></symbol>
  <symbol id="i-gift" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-1.5-3-5-4-5-1.5S10 8 12 8Zm0 0c1.5-3 5-4 5-1.5S14 8 12 8Z"/></g></symbol>
</defs></svg>`);

const icon = (id) => `<svg><use href="#${id}"/></svg>`;
const pill = (id, text, cls = '') => `<span class="pill ${cls}">${icon(id)}${text}</span>`;
const leaf = (style) => `<svg class="leaf" style="${style}"><use href="#sprout"/></svg>`;
const phone = (shot, style = '', cls = '') =>
  `<div class="phone ${cls}" style="${style}"><div class="screen"><img src="shots/${shot}.png"></div></div>`;
const head = (title, sub = '', before = '', after = '') =>
  `<div class="head">${before}<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}${after}</div>`;
const brand = () => `<div class="brand"><img src="icon.png"><span>Seeding</span></div>`;

// Everything in the app, grouped the way the store frames talk about it. Free, all of it.
const FEATURES = [
  ['i-timer', 'Track', ['Live journey timer', 'Growth stages', '14 milestones', 'Garden view', '25-week heatmap', 'Calendar']],
  ['i-chart', 'Understand', ['Engagement ratio', 'Weekly patterns', 'Danger hours', 'Monthly trend', 'Progress comparisons', 'Activity insights']],
  ['i-wave', 'Resist', ['Urge SOS button', 'Ride the wave timer', 'Quick resets', 'Stoic wisdom']],
  ['i-trophy', 'Grow', ['14 win categories', 'Custom tags', '31 badges', 'Relapse notes & triggers']],
  ['i-lock', 'Yours alone', ['No account', 'Stays on your phone', 'App lock', 'Excel export', 'Light & dark', 'Gentle reminders']],
];
const featureWall = (top = 470) => `<div class="wall" style="top:${top}px">${FEATURES.map(([id, title, items]) => `
  <div class="group"><h3>${icon(id)}${title}</h3>
    <div class="chips">${items.map((t) => `<span class="chip">${icon('i-check')}${t}</span>`).join('')}</div>
  </div>`).join('')}</div>`;
const featureCount = FEATURES.reduce((n, [, , items]) => n + items.length, 0);

function mount(frames, fallback) {
  const key = location.hash.slice(1) || fallback;
  for (const [id, f] of Object.entries(frames)) {
    const el = document.createElement('div');
    el.className = ['frame', f.dark ? 'dark' : '', f.cls || '', id === key ? 'on' : ''].join(' ');
    el.innerHTML = f.html;
    document.body.appendChild(el);
  }
}
