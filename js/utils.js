/* ===========================================================
   utils.js — shared helpers, calculations, and sorting
   =========================================================== */

window.$ = (sel, ctx = document) => ctx.querySelector(sel);
window.$$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
window.el = (tag, attrs = {}, txt = '') => {
  const n = document.createElement(tag);
  for (const k in attrs) {
    if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  if (txt) n.textContent = txt;
  return n;
};

window.safeKey = function (name) {
  if (!name) return '';
  return name.toString().toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};

window.getMaterialImagePath = function (materialName) {
  if (!materialName) return 'assets/materials/default.png';
  const key = safeKey(materialName);
  if (MATERIAL_IMAGE_PATHS[key]) return MATERIAL_IMAGE_PATHS[key];
  const map = MATERIAL_CATEGORY_MAP[materialName] || '';
  let folder = 'materials';
  if (map === 'Gifts') folder = 'gifts';
  else if (map === 'Disc') folder = 'disc';
  return `assets/${folder}/${key}.png`;
};

window.ensureImage = (p) => {
  if (!p) return 'assets/materials/default.png';
  if (p.includes('/')) return p;
  return getMaterialImagePath(p);
};

/* Sorting and calculations */
window.calculateSkillMaterials = function (fromLvl, toLvl) {
  const r = { basic: 0, inter: 0, adv: 0, boss: 0, chess: 0 };
  for (const s of skillMaterialTable)
    if (s.to > fromLvl && s.to <= toLvl) {
      r.basic += s.basic || 0;
      r.inter += s.inter || 0;
      r.adv += s.adv || 0;
      r.boss += s.boss || 0;
      r.chess += s.chess || 0;
    }
  return r;
};

window.calculateExperienceNeeded = function (current, desired) {
  let totalExp = 0,
    totalDorra = 0;
  if (Number(desired) <= Number(current)) return { totalExp: 0, totalDorra: 0 };
  for (const row of experienceTable)
    if (row.from >= Number(current) && row.to <= Number(desired)) {
      totalExp += row.exp || 0;
      totalDorra += row.dorra || 0;
    }
  return { totalExp, totalDorra };
};

window.expToMaterials = function (expAmount) {
  const result = {};
  let remaining = Number(expAmount) || 0;
  for (const mat of EXP_MATERIALS) {
    const count = Math.floor(remaining / mat.value);
    if (count > 0) {
      result[mat.name] = (result[mat.name] || 0) + count;
      remaining -= count * mat.value;
    }
  }
  return result;
};

window.aggregateMaps = function (listOfMaps) {
  const out = {};
  listOfMaps.forEach((m) => {
    for (const k in m) {
      if (!out[k]) out[k] = { ...m[k] };
      else out[k].count += m[k].count;
    }
  });
  return out;
};

window.materialSort = function (a, b) {
  const an = a?.name || a || '';
  const bn = b?.name || b || '';
  return an.localeCompare(bn);
};
