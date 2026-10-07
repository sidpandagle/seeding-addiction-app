// Real UI pieces cut out of the 1080x2400 captures in shots/.
// [shot, x, y, width, height, corner radius of the piece] in screenshot pixels.
// check.html shows every crop so the boxes can be nudged after a recapture.
window.CROPS = {
  timer:        ['home-top', 55, 392, 970, 613, 62],
  winTile:      ['home-top', 55, 1062, 457, 416, 50],
  relapseTile:  ['home-top', 568, 1062, 454, 416, 50],
  tiles:        ['home-tiles', 55, 625, 970, 550, 44],
  distraction:  ['home-tiles', 55, 1340, 735, 548, 50],
  garden:       ['garden-top', 55, 808, 970, 835, 50],
  heatmap:      ['garden', 57, 1567, 968, 513, 50],
  calendar:     ['calendar', 57, 832, 965, 923, 50],
  engagement:   ['ins-top', 40, 368, 1000, 1112, 50],
  timeOfDay:    ['insights', 38, 835, 1004, 887, 50],
  danger:       ['insights', 88, 1410, 907, 263, 36],
  donut:        ['ins-donut', 40, 751, 1000, 670, 40],
  rideIdle:     ['sos-idle', 45, 392, 987, 950, 50],
  rideRunning:  ['wave', 45, 392, 987, 808, 50],
  quote:        ['wave', 45, 1247, 987, 388, 40],
  shockTiles:   ['sos-tiles', 45, 1478, 987, 680, 30],
  giveResist:   ['sos-tiles', 45, 706, 987, 739, 40],
  badgeProgress:['badges-top', 55, 500, 970, 335, 50],
  badgeGrid:    ['badges', 40, 672, 1000, 935, 30],
  badgePop:     ['badge-pop', 55, 600, 970, 1195, 64],
  privacy:      ['about', 56, 1154, 968, 543, 50],
  aboutCard:    ['about', 56, 348, 968, 679, 50],
  milestones:   ['achievements', 40, 880, 990, 1200, 30],
  msProgress:   ['achievements', 55, 500, 970, 335, 50],
  winCard:      ['win', 40, 630, 1000, 1390, 50],
  winStats:     ['win', 45, 330, 990, 265, 44],
  dTimer:       ['d-home', 53, 389, 970, 614, 62],
  dLogTiles:    ['d-home', 53, 1063, 970, 412, 50],
  dDonut:       ['d-donut', 33, 755, 1003, 660, 40],
  dBadgeGrid:   ['d-badges', 40, 1188, 1000, 940, 30],
  dGarden:      ['d-garden', 55, 808, 968, 832, 50],
  dDanger:      ['d-ins', 88, 1408, 907, 264, 36],
};

// A crop as a positioned element. scale 1 = screenshot pixels.
window.cut = (name, scale = 1, style = '', cls = '') => {
  const [shot, x, y, w, h, r] = window.CROPS[name];
  return `<div class="cut ${cls}" style="width:${w * scale}px;height:${h * scale}px;border-radius:${r * scale}px;` +
    `background-image:url(shots/${shot}.png);background-size:${1080 * scale}px auto;` +
    `background-position:${-x * scale}px ${-y * scale}px;${style}"></div>`;
};
