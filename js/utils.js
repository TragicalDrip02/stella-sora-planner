/* ===========================================================
   utils.js — shared helpers, constants, and minor calculations
   =========================================================== */

/* DOM utilities */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const el = (tag, attrs = {}, txt = '') => {
  const n = document.createElement(tag);
  for (const k in attrs) {
    if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  if (txt) n.textContent = txt;
  return n;
};

/* Key normalization */
function safeKey(name) {
  if (!name) return '';
  return name.toString().toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/* Get image path by name */
function getMaterialImagePath(materialName) {
  if (!materialName) return 'assets/materials/default.png';
  const key = safeKey(materialName);
  if (MATERIAL_IMAGE_PATHS[key]) return MATERIAL_IMAGE_PATHS[key];

  const map = MATERIAL_CATEGORY_MAP[materialName] || '';
  let folder = 'materials';
  if (map === 'Gifts') folder = 'gifts';
  else if (map === 'Disc') folder = 'disc';
  else folder = 'materials';
  return `assets/${folder}/${key}.png`;
}

const ensureImage = (p) => {
  if (!p) return 'assets/materials/default.png';
  if (p.indexOf('/') >= 0) return p;
  return getMaterialImagePath(p);
};

/* Category detection helpers */
function detectCategoryForName(name) {
  if (!name) return 'Misc';

  for (const cid in characterAscensionMaterials) {
    const arr = characterAscensionMaterials[cid] || [];
    if (arr.includes(name)) return 'Ascension';
  }

  for (const cid in characterDiscAscensionMaterials) {
    const arr = characterDiscAscensionMaterials[cid] || [];
    if (arr.includes(name)) return 'Ascension';
  }

  for (const group in WEEKLY_BOSS_GROUPS) {
    if (WEEKLY_BOSS_GROUPS[group].includes(name)) return 'Boss';
  }

  if (MATERIAL_CATEGORY_MAP[name]) {
    const map = MATERIAL_CATEGORY_MAP[name];
    if (map === 'Currency') return 'Dorra';
    if (map === 'Skill Materials') return 'Skill';
    if (map === 'Ascension Materials') return 'Ascension';
    if (map === 'Weekly Boss') return 'Boss';
    if (map === 'Emblems') return 'Emblems';
    if (map === 'Experience') return 'Experience';
    if (map === 'Gifts') return 'Gifts';
    if (map === 'Disc') return 'Disc';
    return map;
  }

  const n = (name || '').toLowerCase();
  if (n.includes('dorra')) return 'Dorra';
  if (/exp|experience|trekker/i.test(name)) return 'Experience';
  return 'Misc';
}

function rarityValue(r) {
  if (!r) return 2;
  const x = (r || '').toString().toLowerCase();
  if (x.includes('basic')) return 1;
  if (x.includes('intermediate')) return 2;
  if (x.includes('advanced')) return 3;
  return 2;
}

/* Aggregation helpers */
function aggregateMaps(listOfMaps) {
  const out = {};
  listOfMaps.forEach((m) => {
    for (const k in m) {
      if (!out[k]) out[k] = { ...m[k] };
      else out[k].count += m[k].count;
    }
  });
  return out;
}

/* Sorting helpers */
const ORDER_MAP = {
  Dorra: 0,
  Experience: 1,
  Character: 2,
  Disc: 3,
  Skill: 4,
  Ascension: 5,
  Boss: 6,
  Emblems: 7,
  Gifts: 8,
  Misc: 9,
};

function materialSort(a, b) {
  const an = a?.name || a || '';
  const bn = b?.name || b || '';
  const ca = detectCategoryForName(an);
  const cb = detectCategoryForName(bn);
  if (ca !== cb) return (ORDER_MAP[ca] || 999) - (ORDER_MAP[cb] || 999);
  return an.localeCompare(bn);
}

/* Level/experience helpers */
function calculateSkillMaterials(fromLvl, toLvl) {
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
}

function calculateExperienceNeeded(current, desired) {
  let totalExp = 0,
    totalDorra = 0;
  if (Number(desired) <= Number(current)) return { totalExp: 0, totalDorra: 0 };
  for (const row of experienceTable)
    if (row.from >= Number(current) && row.to <= Number(desired)) {
      totalExp += row.exp || 0;
      totalDorra += row.dorra || 0;
    }
  return { totalExp, totalDorra };
}

function expToMaterials(expAmount) {
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
}
