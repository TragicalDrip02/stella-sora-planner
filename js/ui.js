/* ---------------------------
   List modal filters & population
----------------------------*/
const listModal = $('#listModal');
const modalTiles = $('#modalTiles');
const listSearch = $('#listSearch');
const listFilters = $('#listFilters');
const closeListModal = $('#closeListModal');

const FILTERS_FOR_LIST = [
    { label: 'Element', id: 'filterElement', options: ['', 'Aqua', 'Ignis', 'Terra', 'Ventus', 'Lux', 'Umbra'] },
    { label: 'Quality', id: 'filterQuality', options: ['', '4', '5'] },
    { label: 'Position', id: 'filterPosition', options: ['', 'Versatile', 'Vanguard', 'Support'] },
    { label: 'Faction', id: 'filterFaction', options: ['', 'Yunji Studio', 'Neo Grace Organization', 'Scarlet Sights Media', 'Grace Imperium', 'New Star Guild', 'Petal Bloom Guild', 'Imperial Guard', 'Ashwind Clan', 'Post Haste', 'Baize Bureau', 'United Harvest', 'Freelance Trekker', 'Trekker Association', 'Goodwind Homecare', 'Fenhuang Diner', 'White Cat Troupe'] },
    { label: 'Style', id: 'filterStyle', options: ['', 'Adventurous', 'Creative', 'Steady', 'Collector', 'Inquisitive'] }
];

function createListFilters() {
    listFilters.innerHTML = '';
    FILTERS_FOR_LIST.forEach(f => {
        const lbl = el('label', { style: 'margin:0;font-size:13px;color:var(--muted-dark)' }, `${f.label}: `);
        const s = el('select', { id: f.id });
        f.options.forEach(opt => s.appendChild(el('option', {}, opt)));
        s.style.padding = '8px'; s.style.borderRadius = '8px'; s.style.border = '1px solid rgba(255,255,255,0.04)'; s.style.background = 'rgba(0,0,0,0.06)'; s.style.color = 'inherit';
        lbl.appendChild(s); listFilters.appendChild(lbl);
    });
}

function populateModalCharacters() {
    const saved = loadSaved();
    const q = (listSearch.value || '').toLowerCase();
    const fe = $('#filterElement')?.value || '';
    const fq = $('#filterQuality')?.value || '';
    const fp = $('#filterPosition')?.value || '';
    const ff = $('#filterFaction')?.value || '';
    const fs = $('#filterStyle')?.value || '';

    // Get the selected sorting option
    const sortBy = $('#sortCharactersSelect')?.value || 'default';

    modalTiles.innerHTML = '';
    let list = characters.map(c => ({ ...c, savedCfg: saved.find(s => s.charId === c.id) }));

    // Filter characters
    list = list.filter(c => {
        if (q && !(c.name.toLowerCase().includes(q) || (c.element || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q))) return false;
        if (fe && c.element !== fe) return false;
        if (fq && c.quality !== fq) return false;
        if (fp && c.position !== fp) return false;
        if (ff && c.faction !== ff) return false;
        if (fs && c.style !== fs) return false;
        return true;
    });

    // SORTING LOGIC
    list.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'element':
                return (a.element || '').localeCompare(b.element || '');
            case 'quality':
                // Sort by quality (rarity) - 5 stars first, then 4 stars
                return (b.quality || '').localeCompare(a.quality || '');
            case 'position':
                return (a.position || '').localeCompare(b.position || '');
            case 'faction':
                return (a.faction || '').localeCompare(b.faction || '');
            case 'default':
            default:
                // Default sorting
                return 0;
        }
    });

    list.forEach(c => {
        const tile = el('div', { class: 'tile' });
        const already = saved.find(s => s.charId === c.id && !s.completed);
        if (already) tile.classList.add('disabled');
        tile.innerHTML = `<img src="${c.image}" alt="${c.name}"><div style="font-weight:800">${c.name}</div><div class="small muted">${c.element} • ${c.quality}★</div>`;
        tile.addEventListener('click', () => {
            if (tile.classList.contains('disabled')) return;
            listModal.classList.remove('open');
            listModal.setAttribute('aria-hidden', 'true');
            openDetailsForNew(c.id);
        });
        modalTiles.appendChild(tile);
    });
}

/* ---------------------------
   Details modal behavior & validation
   - Level selects are 1,10,20,...,90
   - Skills limited by ascension tier rules
   - Desired >= Current enforced
----------------------------*/
const detailsModalEl = $('#detailsModal');
const detailsPortrait = $('#detailsPortrait');
const detailsName = $('#detailsName');
const detailsSub = $('#detailsSub');
const curLevel = $('#curLevel');
const desLevel = $('#desLevel');
const talentsInput = $('#talentsInput');
const saveDetailsBtn = $('#saveDetails');
const detailsCloseBtn = $('#detailsClose');
let editingConfigId = null;

// fill skill selects (1..10)
function fillSkillSelects() {
    const curSelects = $$('.skill-cur', detailsModalEl);
    const desSelects = $$('.skill-des', detailsModalEl);
    [curSelects, desSelects].forEach(group => group.forEach(s => {
        s.innerHTML = '';
        for (let i = 1; i <= 10; i++) s.appendChild(el('option', { value: i }, i));
    }));
}

/* level options 1,10,20,...,90 */
const LEVEL_OPTIONS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90];
function buildLevelSelects() {
    curLevel.innerHTML = ''; desLevel.innerHTML = '';
    LEVEL_OPTIONS.forEach(l => { curLevel.appendChild(el('option', { value: l }, l)); desLevel.appendChild(el('option', { value: l }, l)); });
    curLevel.classList.add('level-select'); desLevel.classList.add('level-select');
}

/* ascension-based max skill mapping per your rules */
function maxSkillForLevel(level) {
    const lv = Number(level);
    if (lv < 20) return 1;
    if (lv < 30) return 2;
    if (lv < 40) return 3;
    if (lv < 50) return 4;
    if (lv < 60) return 5;
    if (lv < 70) return 6;
    if (lv < 80) return 7;
    if (lv < 90) return 8;
    return 10;
}

/* whenever level changes, enforce skill caps */
function enforceSkillCapsForCurrentLevel() {
    const curLv = Number(curLevel.value);
    const desLv = Number(desLevel.value);
    const curMax = maxSkillForLevel(curLv);
    const desMax = maxSkillForLevel(desLv);

    const curSel = $$('.skill-cur', detailsModalEl);
    const desSel = $$('.skill-des', detailsModalEl);

    // apply allowed ranges and adjust values if they exceed allowed
    curSel.forEach(s => {
        const val = Number(s.value);
        // disable options greater than curMax
        Array.from(s.options).forEach(opt => opt.disabled = Number(opt.value) > curMax);
        if (val > curMax) s.value = curMax;
    });
    desSel.forEach(s => {
        const val = Number(s.value);
        Array.from(s.options).forEach(opt => opt.disabled = Number(opt.value) > desMax);
        if (val > desMax) s.value = desMax;
    });

    // also enforce desired skill >= current skill for each pair
    for (let i = 0; i < curSel.length; i++) {
        const c = Number(curSel[i].value) || 1;
        const d = Number(desSel[i].value) || 1;
        if (d < c) desSel[i].value = c;
    }
}

/* ensure levels' desired >= current */
function enforceLevelMonotonicity() {
    const cur = Number(curLevel.value);
    const des = Number(desLevel.value);
    if (des < cur) desLevel.value = cur;
}

function openDetailsForNew(charId) {
    editingConfigId = null;
    const ch = characters.find(c => c.id === charId); if (!ch) return;
    detailsPortrait.style.backgroundImage = `url(${ch.image})`;
    detailsName.textContent = ch.name;
    detailsSub.textContent = `${ch.element} • ${ch.quality}★ • ${ch.position}`;
    buildLevelSelects();
    fillSkillSelects();
    curLevel.value = '1'; desLevel.value = '1';
    const curSel = $$('.skill-cur')[0]; if (curSel) curSel.value = '1';
    $$('.skill-des').forEach(s => s.value = '1');
    talentsInput.value = '0'; $('#obtainedFlag').checked = false;
    enforceSkillCapsForCurrentLevel();
    detailsModalEl.classList.add('open'); detailsModalEl.setAttribute('aria-hidden', 'false');
}

function openDetailsForEdit(cfgId) {
    const saved = loadSaved(); const cfg = saved.find(x => x.id === cfgId); if (!cfg) return;
    editingConfigId = cfgId;
    const ch = characters.find(c => c.id === cfg.charId); if (!ch) return;
    detailsPortrait.style.backgroundImage = `url(${ch.image})`;
    detailsName.textContent = ch.name; detailsSub.textContent = `${ch.element} • ${ch.quality}★ • ${ch.position}`;
    buildLevelSelects(); fillSkillSelects();
    curLevel.value = cfg.currentLevel; desLevel.value = cfg.desiredLevel;
    const curSelArr = $$('.skill-cur'); const desSelArr = $$('.skill-des');
    if (curSelArr[0]) curSelArr[0].value = cfg.atkCur; if (desSelArr[0]) desSelArr[0].value = cfg.atkDes;
    if (curSelArr[1]) curSelArr[1].value = cfg.mainCur; if (desSelArr[1]) desSelArr[1].value = cfg.mainDes;
    if (curSelArr[2]) curSelArr[2].value = cfg.supCur; if (desSelArr[2]) desSelArr[2].value = cfg.supDes;
    if (curSelArr[3]) curSelArr[3].value = cfg.ultCur; if (desSelArr[3]) desSelArr[3].value = cfg.ultDes;
    talentsInput.value = cfg.talents || 0; $('#obtainedFlag').checked = !!cfg.obtained;
    enforceSkillCapsForCurrentLevel();
    detailsModalEl.classList.add('open'); detailsModalEl.setAttribute('aria-hidden', 'false');
}

/* ---------------------------
   Inventory modal logic
----------------------------*/
const manageInventoryBtn = $('#manageInventoryBtn');
const inventoryModal = $('#inventoryModal');
const inventoryGrid = $('#inventoryGrid');
const inventoryFilter = $('#inventoryFilter');
const inventoryDorra = $('#inventoryDorra');
const inventorySaveClose = $('#inventorySaveClose');
const inventoryDeleteAll = $('#inventoryDeleteAll');
const inventoryImportBtn = $('#inventoryImport');
const inventoryExportBtn = $('#inventoryExport');
const invImportFile = $('#invImportFile');

function buildMasterMaterialsList() {
    const set = {};
    // ascension
    for (const k in characterAscensionMaterials) (characterAscensionMaterials[k] || []).forEach(n => { if (!n) return; set[n] = { name: n, image: ensureImage(n) }; });
    // skill
    for (const k in characterSkillCartridges) (characterSkillCartridges[k] || []).forEach(n => { if (!n) return; set[n] = { name: n, image: ensureImage(n) }; });
    // boss
    for (const k in characterBossMaterials) (characterBossMaterials[k] || []).forEach(n => { if (!n) return; set[n] = { name: n, image: ensureImage(n) }; });
    // disc & emblems & gifts & exp materials
    EXP_MATERIALS.forEach(m => set[m.name] = set[m.name] || { name: m.name, image: ensureImage(m.name) });
    ['Cracked Disc', 'Pure Quality Treasure', 'Elegant Rim', 'Starlit Colored Glass'].forEach(n => set[n] = set[n] || { name: n, image: ensureImage(n) });
    ['Good Citizen Point', 'Association Contribution Certificate', 'Grace Voucher'].forEach(n => set[n] = set[n] || { name: n, image: ensureImage(n) });
    ['Love Candle', 'Blazing Wings', 'Card Photo Capturer', 'Reflective Photo Capturer', 'Portable Blower', 'Exquisite Blower', 'Whisper Wind Spinner', 'Chilling Wind Spinner', 'Rising Star', 'Emerging Talent', 'Stellanite Enchantment', 'Moonlit Companion', 'Summer Chill Crushed Ice', 'Fragrant Ice Delight', 'Gilded Ceramic Bowl', 'Blossom Porcelain Cup'].forEach(n => set[n] = set[n] || { name: n, image: ensureImage(n) });
    // Dorra
    set['Dorra'] = set['Dorra'] || { name: 'Dorra', image: ensureImage('Dorra') };
    // include any keys present in map not yet added
    for (const k in MATERIAL_CATEGORY_MAP) if (!set[k]) set[k] = { name: k, image: ensureImage(k) };
    return Object.values(set);
}
let masterMaterials = buildMasterMaterialsList();

function matchesFilterCategory(item, filterLabel) {
    if (!filterLabel || filterLabel === 'All') return true;
    const name = (item.name || '').toString();
    const mapped = MATERIAL_CATEGORY_MAP[name] || null;
    switch (filterLabel) {
        case 'Experience': return mapped === 'Experience' || mapped === 'Currency' || /experience|trekker|novice|senior/i.test(name);
        case 'Character': return mapped === 'Ascension Materials' || mapped === 'Weekly Boss' || mapped === 'Ascension Materials';
        case 'Disc': return mapped === 'Disc';
        case 'Skill Materials': return mapped === 'Skill Materials' || mapped === 'Skill';
        case 'Disc Materials': return mapped === 'Disc';
        case 'Ascension Materials': return mapped === 'Ascension Materials';
        case 'Weekly Boss': return mapped === 'Weekly Boss';
        case 'Emblems': return mapped === 'Emblems';
        case 'Gifts': return mapped === 'Gifts';
        case 'Miscellaneous': return !mapped || mapped === 'Miscellaneous';
        default: return true;
    }
}

function renderInventoryGrid() {
    const inv = loadInventory();
    const counts = inv.counts || {};
    const filterVal = inventoryFilter.value;
    masterMaterials = buildMasterMaterialsList();
    const items = masterMaterials.slice().sort(materialSort);
    inventoryGrid.innerHTML = '';
    items.forEach(item => {
        if (!matchesFilterCategory(item, filterVal)) return;
        const div = el('div', { class: 'inv-item', 'data-tooltip': item.name || '' });
        const val = counts[item.name] || 0;
        div.innerHTML = `<img src="${ensureImage(item.image || item.name)}" alt="${item.name}"><input class="inv-input" type="number" min="0" value="${val}" data-name="${item.name}">`;
        inventoryGrid.appendChild(div);
    });
    inventoryDorra.value = inv.dorra || '';
}