/* ---------------------------
   Calculation helpers
----------------------------*/

/* helper: map name -> explicit path if provided */
function safeKey(name) {
    if (!name) return '';
    return name.toString().toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function getMaterialImagePath(materialName) {
    if (!materialName) return 'assets/materials/default.png';
    const key = safeKey(materialName);
    if (MATERIAL_IMAGE_PATHS[key]) return MATERIAL_IMAGE_PATHS[key];
    // fallback rules: gifts/disc/materials by heuristic
    const map = MATERIAL_CATEGORY_MAP[materialName] || '';
    let folder = 'materials';
    if (map === 'Gifts') folder = 'gifts';
    else if (map === 'Disc') folder = 'disc';
    else folder = 'materials';
    return `assets/${folder}/${key}.png`;
}

const ensureImage = p => { if (!p) return 'assets/materials/default.png'; if (p.indexOf('/') >= 0) return p; return getMaterialImagePath(p); };

function expToMaterials(expAmount) {
    const result = {};
    let remaining = Number(expAmount) || 0;
    for (const mat of EXP_MATERIALS) {
        const count = Math.floor(remaining / mat.value);
        if (count > 0) { result[mat.name] = (result[mat.name] || 0) + count; remaining -= count * mat.value; }
    }
    return result;
}

function calculateSkillMaterials(fromLvl, toLvl) {
    const r = { basic: 0, inter: 0, adv: 0, boss: 0, chess: 0 };
    for (const s of skillMaterialTable) if (s.to > fromLvl && s.to <= toLvl) { r.basic += s.basic || 0; r.inter += s.inter || 0; r.adv += s.adv || 0; r.boss += s.boss || 0; r.chess += s.chess || 0; }
    return r;
}

function calculateExperienceNeeded(current, desired) {
    let totalExp = 0, totalDorra = 0;
    if (Number(desired) <= Number(current)) return { totalExp: 0, totalDorra: 0 };
    for (const row of experienceTable) if (row.from >= Number(current) && row.to <= Number(desired)) { totalExp += (row.exp || 0); totalDorra += (row.dorra || 0); }
    return { totalExp, totalDorra };
}

/* ---------------------------
   Category detection & sorting fixes:
   Ensure ascension materials are detected as Ascension
   Ensure Weekly boss materials are detected as Boss
----------------------------*/
function detectCategoryForName(name) {
    if (!name) return 'Misc';
    for (const cid in characterAscensionMaterials) {
        const arr = characterAscensionMaterials[cid] || [];
        if (arr.includes(name)) return 'Ascension';
    }
    // check disc ascension lists if needed
    for (const cid in characterDiscAscensionMaterials) {
        const arr = characterDiscAscensionMaterials[cid] || [];
        if (arr.includes(name)) return 'Ascension';
    }
    // weekly boss detection
    for (const group in WEEKLY_BOSS_GROUPS) {
        if (WEEKLY_BOSS_GROUPS[group].includes(name)) return 'Boss';
    }
    // explicit map
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

function rarityValue(r) { if (!r) return 2; const x = (r || '').toString().toLowerCase(); if (x.includes('basic')) return 1; if (x.includes('intermediate')) return 2; if (x.includes('advanced')) return 3; return 2; }

function ascensionGroupIndex(itemName) {
    for (const g in characterAscensionMaterials) {
        const arr = characterAscensionMaterials[g];
        const idx = arr.indexOf(itemName);
        if (idx >= 0) return { group: g, idx };
    }
    return { group: null, idx: 9999 };
}

function skillGroupIndex(itemName) {
    for (const g in characterSkillCartridges) {
        const arr = characterSkillCartridges[g];
        const idx = arr.indexOf(itemName);
        if (idx >= 0) return { group: g, idx };
    }
    return { group: null, idx: 9999 };
}

function bossGroupIndex(itemName) {
    for (const g in characterBossMaterials) {
        const arr = characterBossMaterials[g];
        const idx = arr.indexOf(itemName);
        if (idx >= 0) return { group: g, idx };
    }
    return { group: null, idx: 9999 };
}

const ORDER_MAP = { 'Dorra': 0, 'Experience': 1, 'Character': 2, 'Disc': 3, 'Skill': 4, 'Ascension': 5, 'Boss': 6, 'Emblems': 7, 'Gifts': 8, 'Misc': 9 };

function materialSort(a, b) {
    const an = (a && a.name) ? a.name : (a || '');
    const bn = (b && b.name) ? b.name : (b || '');
    const ca = detectCategoryForName(an);
    const cb = detectCategoryForName(bn);
    if (ca !== cb) return (ORDER_MAP[ca] || 999) - (ORDER_MAP[cb] || 999);
    if (ca === 'Ascension') {
        const aa = ascensionGroupIndex(an), bb = ascensionGroupIndex(bn);
        if (aa.group !== bb.group) return (aa.group || '').localeCompare(bb.group || '');
        if (aa.idx !== bb.idx) return aa.idx - bb.idx;
        return (rarityValue(a.rarity || '') - rarityValue(b.rarity || '')) || an.localeCompare(bn);
    }
    if (ca === 'Skill') {
        const sa = skillGroupIndex(an), sb = skillGroupIndex(bn);
        if (sa.group !== sb.group) return (sa.group || '').localeCompare(sb.group || '');
        if (sa.idx !== sb.idx) return sa.idx - sb.idx;
        return (rarityValue(a.rarity || '') - rarityValue(b.rarity || '')) || an.localeCompare(bn);
    }
    if (ca === 'Boss') {
        const ba = bossGroupIndex(an), bb = bossGroupIndex(bn);
        if (ba.group !== bb.group) return (ba.group || '').localeCompare(bb.group || '');
        if (ba.idx !== bb.idx) return ba.idx - bb.idx;
        return (rarityValue(a.rarity || '') - rarityValue(b.rarity || '')) || an.localeCompare(bn);
    }
    return an.localeCompare(bn);
}

/* ---------------------------
   Material calculations
   - Ascension materials come only from characterAscensionMaterials via tiers
   - Skill materials from skillMaterialTable + cartridges
   - Weekly boss materials for skill-level are derived from characterBossMaterials
   - Experience breakdown into materials
----------------------------*/
function calcAscensionMaterialsForChar(charId, currentLevel, desiredLevel) {
    const ch = characters.find(c => c.id === charId); if (!ch) return {};
    const tiers = ch.tiers.filter(t => t.level > currentLevel && t.level <= desiredLevel);
    const out = {};
    tiers.forEach(t => t.materials.forEach(m => { if (!out[m.name]) out[m.name] = { ...m }; else out[m.name].count += m.count; }));
    return out;
}

function calcSkillMaterialsForChar(charId, curSkill, desSkill) {
    const diff = Math.max(0, Number(desSkill) - Number(curSkill)); if (diff <= 0) return {};
    // compute materials by skill increments using skillMaterialTable
    const mats = calculateSkillMaterials(Number(curSkill), Number(desSkill));
    const skillList = characterSkillCartridges[charId] || [];
    const out = {};
    if (mats.basic > 0) { const nm = skillList[0] || 'Tapping Game Cartridge'; out[nm] = { name: nm, image: ensureImage(nm), type: 'Skill', rarity: 'Basic', count: mats.basic }; }
    if (mats.inter > 0) { const nm = skillList[1] || 'Rhythm Game Cartridge'; out[nm] = { name: nm, image: ensureImage(nm), type: 'Skill', rarity: 'Intermediate', count: mats.inter }; }
    if (mats.adv > 0) { const nm = skillList[2] || 'Magic Sound Game Cartridge'; out[nm] = { name: nm, image: ensureImage(nm), type: 'Skill', rarity: 'Advanced', count: mats.adv }; }
    if (mats.chess > 0) { const nm = 'Chess Piece of Skill'; out[nm] = { name: nm, image: ensureImage(nm), type: 'Skill', rarity: 'Misc', count: mats.chess }; }
    if (mats.boss > 0) {

        const bossArr = characterBossMaterials[charId] || [];

        if (bossArr.length > 0) {
            const bossName = bossArr[0];
            if (!out[bossName]) out[bossName] = { name: bossName, image: ensureImage(bossName), type: 'Boss', rarity: 'Boss', count: mats.boss };
            else out[bossName].count += mats.boss;
        } else {
            // fallback generic boss essence
            const bossName = 'Boss Essence';
            out[bossName] = out[bossName] || { name: bossName, image: ensureImage(bossName), type: 'Boss', rarity: 'Boss', count: 0 };
            out[bossName].count += mats.boss;
        }
    }
    return out;
}

function aggregateMaps(listOfMaps) {
    const out = {};
    listOfMaps.forEach(m => { for (const k in m) { if (!out[k]) out[k] = { ...m[k] }; else out[k].count += m[k].count; } });
    return out;
}

/*
 computeMaterialsForConfig returns array of material objects for a specific saved config
 Experience is split into EXP_MATERIALS entries;
*/
function computeMaterialsForConfig(cfg) {
    const asc = calcAscensionMaterialsForChar(cfg.charId, cfg.currentLevel, cfg.desiredLevel);
    const atk = calcSkillMaterialsForChar(cfg.charId, cfg.atkCur, cfg.atkDes);
    const main = calcSkillMaterialsForChar(cfg.charId, cfg.mainCur, cfg.mainDes);
    const sup = calcSkillMaterialsForChar(cfg.charId, cfg.supCur, cfg.supDes);
    const ult = calcSkillMaterialsForChar(cfg.charId, cfg.ultCur, cfg.ultDes);
    const expCalc = calculateExperienceNeeded(cfg.currentLevel, cfg.desiredLevel);

    const expEntries = {};
    if (expCalc.totalExp > 0) {
        const breakdown = expToMaterials(expCalc.totalExp);
        for (const matName in breakdown) {
            expEntries[matName] = { name: matName, image: ensureImage(matName), type: 'Experience', count: breakdown[matName] };
        }
    }

    const dorraMap = {};
    if (expCalc.totalDorra > 0) dorraMap['Dorra'] = { name: 'Dorra', image: ensureImage('Dorra'), type: 'Currency', count: expCalc.totalDorra };

    return Object.values(aggregateMaps([asc, atk, main, sup, ult, expEntries, dorraMap]));
}

function computeCombinedTotals() {
    const saved = loadSaved().filter(cfg => !cfg.ignored && !cfg.completed);
    const maps = saved.map(cfg => {
        const asc = calcAscensionMaterialsForChar(cfg.charId, cfg.currentLevel, cfg.desiredLevel);
        const atk = calcSkillMaterialsForChar(cfg.charId, cfg.atkCur, cfg.atkDes);
        const main = calcSkillMaterialsForChar(cfg.charId, cfg.mainCur, cfg.mainDes);
        const sup = calcSkillMaterialsForChar(cfg.charId, cfg.supCur, cfg.supDes);
        const ult = calcSkillMaterialsForChar(cfg.charId, cfg.ultCur, cfg.ultDes);
        const expCalc = calculateExperienceNeeded(cfg.currentLevel, cfg.desiredLevel);
        const expEntries = {};
        if (expCalc.totalExp > 0) {
            const breakdown = expToMaterials(expCalc.totalExp);
            for (const matName in breakdown) expEntries[matName] = { name: matName, image: ensureImage(matName), type: 'Experience', count: breakdown[matName] };
        }
        const expMap = {};
        if (expCalc.totalDorra > 0) expMap['Dorra'] = { name: 'Dorra', image: ensureImage('Dorra'), type: 'Currency', count: expCalc.totalDorra };
        return aggregateMaps([asc, atk, main, sup, ult, expEntries, expMap]);
    });
    const merged = {};
    maps.forEach(m => { for (const k in m) { if (!merged[k]) merged[k] = { ...m[k] }; else merged[k].count += m[k].count; } });
    return Object.values(merged);
}