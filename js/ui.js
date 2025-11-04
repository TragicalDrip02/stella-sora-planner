/* ===========================================================
   ui.js — rendering, modals, events, and initialization
   =========================================================== */

function calcAscensionMaterialsForChar(charId, currentLevel, desiredLevel) {
  const ch = characters.find((c) => c.id === charId);
  if (!ch) return {};
  const tiers = ch.tiers.filter((t) => t.level > currentLevel && t.level <= desiredLevel);
  const out = {};
  tiers.forEach((t) =>
    t.materials.forEach((m) => {
      if (!out[m.name]) out[m.name] = { ...m };
      else out[m.name].count += m.count;
    })
  );
  return out;
}

function calcSkillMaterialsForChar(charId, curSkill, desSkill) {
  const diff = Math.max(0, Number(desSkill) - Number(curSkill));
  if (diff <= 0) return {};
  const mats = calculateSkillMaterials(Number(curSkill), Number(desSkill));
  const skillList = characterSkillCartridges[charId] || [];
  const out = {};
  if (mats.basic > 0) {
    const nm = skillList[0] || "Tapping Game Cartridge";
    out[nm] = { name: nm, image: ensureImage(nm), count: mats.basic };
  }
  return out;
}

function computeMaterialsForConfig(cfg) {
  const asc = calcAscensionMaterialsForChar(cfg.charId, cfg.currentLevel, cfg.desiredLevel);
  const atk = calcSkillMaterialsForChar(cfg.charId, cfg.atkCur, cfg.atkDes);
  const expCalc = calculateExperienceNeeded(cfg.currentLevel, cfg.desiredLevel);
  const expEntries = {};
  if (expCalc.totalExp > 0) {
    const breakdown = expToMaterials(expCalc.totalExp);
    for (const matName in breakdown)
      expEntries[matName] = { name: matName, image: ensureImage(matName), count: breakdown[matName] };
  }
  const dorraMap = {};
  if (expCalc.totalDorra > 0)
    dorraMap["Dorra"] = { name: "Dorra", image: ensureImage("Dorra"), count: expCalc.totalDorra };
  return Object.values(aggregateMaps([asc, atk, expEntries, dorraMap]));
}

/* Local storage helpers */
const STORAGE_KEY = "stella_sora_saved";
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveConfig(cfg) {
  const arr = loadSaved();
  const i = arr.findIndex((c) => c.charId === cfg.charId);
  if (i >= 0) arr[i] = cfg;
  else arr.push(cfg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* Rendering */
function renderMaterials() {
  const grid = $("#materialsGrid");
  grid.innerHTML = "";
  const saved = loadSaved();
  const combined = aggregateMaps(saved.map(computeMaterialsForConfig));
  const mats = Object.values(combined).sort(materialSort);
  mats.forEach((m) => {
    const div = el("div", { class: "material" });
    const img = el("img", { src: m.image, alt: m.name });
    const cnt = el("div", { class: "mat-count" }, m.count.toLocaleString());
    div.append(img, cnt);
    grid.append(div);
  });
}

function renderSavedCharacters() {
  const grid = $("#characterGrid");
  const saved = loadSaved();
  grid.innerHTML = "";
  saved.forEach((cfg) => {
    const ch = characters.find((c) => c.id === cfg.charId);
    if (!ch) return;
    const card = el("div", { class: "character-card card" });
    const top = el("div", { class: "char-top" });
    const name = el("div", { class: "char-name" }, ch.name);
    top.append(name);
    const portrait = el("div", { class: "char-portrait" });
    portrait.style.backgroundImage = `url(${ch.image})`;
    const body = el("div", { class: "char-body" });
    body.append(portrait);
    card.append(top, body);
    grid.append(card);
  });
}

/* Initialization */
function initUI() {
  $("#addCharacterBtn").addEventListener("click", () => {
    const sample = { charId: "amber", currentLevel: 1, desiredLevel: 20, atkCur: 1, atkDes: 3 };
    saveConfig(sample);
    renderSavedCharacters();
    renderMaterials();
  });

  renderSavedCharacters();
  renderMaterials();
}

document.addEventListener("DOMContentLoaded", initUI);
