/* ---------------------------
   Small helpers
----------------------------*/
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
const el = (t, a = {}, txt = '') => { const n = document.createElement(t); for (const k in a) { if (k.startsWith('on') && typeof a[k] === 'function') n.addEventListener(k.slice(2), a[k]); else n.setAttribute(k, a[k]); } if (txt) n.textContent = txt; return n; };

/* ---------------------------
   Event listeners setup
----------------------------*/
function setupEventListeners() {
    // Character list modal
    $('#addCharacterBtn').addEventListener('click', () => {
        createListFilters();
        populateModalCharacters();
        listModal.classList.add('open');
        listModal.setAttribute('aria-hidden', 'false');

        // Re-attach event listeners for filters to ensure they work
        FILTERS_FOR_LIST.forEach(f => {
            const filterEl = $(`#${f.id}`);
            if (filterEl) {
                filterEl.addEventListener('change', populateModalCharacters);
            }
        });
    });
    closeListModal.addEventListener('click', () => listModal.classList.remove('open'));

    // Details modal
    curLevel.addEventListener('change', () => { enforceLevelMonotonicity(); enforceSkillCapsForCurrentLevel(); });
    desLevel.addEventListener('change', () => { enforceLevelMonotonicity(); enforceSkillCapsForCurrentLevel(); });
    detailsModalEl.addEventListener('change', (e) => {
        // if skill selects changed, ensure desired >= current
        if (e.target && (e.target.classList && (e.target.classList.contains('skill-cur') || e.target.classList.contains('skill-des')))) {
            enforceSkillCapsForCurrentLevel();
        }
    });

    saveDetailsBtn.addEventListener('click', () => {
        // read skill selects
        const curSelArr = $$('.skill-cur'); const desSelArr = $$('.skill-des');
        const cfg = {
            id: editingConfigId || `cfg_${Date.now()}`,
            charId: characters.find(c => c.name === detailsName.textContent)?.id || characters[0].id,
            currentLevel: Number(curLevel.value),
            desiredLevel: Number(desLevel.value),
            atkCur: Number(curSelArr[0]?.value || 1), atkDes: Number(desSelArr[0]?.value || 1),
            mainCur: Number(curSelArr[1]?.value || 1), mainDes: Number(desSelArr[1]?.value || 1),
            supCur: Number(curSelArr[2]?.value || 1), supDes: Number(desSelArr[2]?.value || 1),
            ultCur: Number(curSelArr[3]?.value || 1), ultDes: Number(desSelArr[3]?.value || 1),
            talents: Number(talentsInput.value || 0),
            obtained: $('#obtainedFlag').checked,
            ignored: false,
            completed: false
        };
        // ensure desired >= current for levels and skills
        if (cfg.desiredLevel < cfg.currentLevel) cfg.desiredLevel = cfg.currentLevel;
        if (cfg.atkDes < cfg.atkCur) cfg.atkDes = cfg.atkCur;
        if (cfg.mainDes < cfg.mainCur) cfg.mainDes = cfg.mainCur;
        if (cfg.supDes < cfg.supCur) cfg.supDes = cfg.supCur;
        if (cfg.ultDes < cfg.ultCur) cfg.ultDes = cfg.ultCur;

        addOrUpdate(cfg);
        detailsModalEl.classList.remove('open'); detailsModalEl.setAttribute('aria-hidden', 'true');
        renderSavedCharacters(); renderMaterials(getMaterialsViewMode()); populateModalCharacters();
    });
    detailsCloseBtn.addEventListener('click', () => { detailsModalEl.classList.remove('open'); detailsModalEl.setAttribute('aria-hidden', 'true'); });

    // Inventory modal
    manageInventoryBtn.addEventListener('click', () => { masterMaterials = buildMasterMaterialsList(); inventoryModal.classList.add('open'); inventoryModal.setAttribute('aria-hidden', 'false'); renderInventoryGrid(); });
    inventoryFilter.addEventListener('change', renderInventoryGrid);

    inventorySaveClose.addEventListener('click', () => {
        const inputs = $$('.inv-input', inventoryGrid);
        const counts = {};
        inputs.forEach(inp => { const n = inp.dataset.name; const v = Number(inp.value) || 0; counts[n] = v; });
        const dorraVal = Number(inventoryDorra.value) || 0;
        saveInventory({ counts, dorra: dorraVal });
        inventoryModal.classList.remove('open'); inventoryModal.setAttribute('aria-hidden', 'true');
        renderMaterials(getMaterialsViewMode());
    });

    inventoryDeleteAll.addEventListener('click', () => {
        if (!confirm('Delete all inventory data? This cannot be undone.')) return;
        localStorage.removeItem(INVENTORY_KEY);
        renderInventoryGrid(); inventoryDorra.value = ''; inventoryModal.classList.remove('open'); inventoryModal.setAttribute('aria-hidden', 'true');
        renderMaterials(getMaterialsViewMode());
    });

    inventoryExportBtn.addEventListener('click', () => {
        const inv = loadInventory() || { counts: {}, dorra: 0 };
        const blob = new Blob([JSON.stringify(inv, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'inventory_backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    inventoryImportBtn.addEventListener('click', () => { invImportFile.value = ''; invImportFile.click(); });
    invImportFile.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const parsed = JSON.parse(ev.target.result);
                const hasCounts = parsed && typeof parsed.counts === 'object' && parsed.counts !== null && !Array.isArray(parsed.counts);
                if (typeof parsed !== 'object' || parsed === null || !hasCounts) {
                    if (!confirm('Imported file does not look like an inventory file. Continue and save anyway?')) return;
                }
                saveInventory(parsed);
                alert('Inventory imported successfully.');
                renderInventoryGrid();
                renderMaterials(getMaterialsViewMode());
            } catch (err) { alert('Failed to parse JSON: ' + err.message); }
        };
        reader.readAsText(f);
    });

    inventoryModal.addEventListener('click', e => { if (e.target === inventoryModal) { inventoryModal.classList.remove('open'); inventoryModal.setAttribute('aria-hidden', 'true'); } });

    // Theme handling
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light')) { document.body.classList.remove('light'); localStorage.setItem(THEME_KEY, 'dark'); themeToggle.textContent = '🌙'; }
        else { document.body.classList.add('light'); localStorage.setItem(THEME_KEY, 'light'); themeToggle.textContent = '☀️'; }
    });

    // Copy Summary
    copyBtn.addEventListener('click', async () => {
        const mode = getMaterialsViewMode();
        const text = buildMaterialsText(mode);
        try { await navigator.clipboard.writeText(text); alert('Materials summary copied to clipboard.'); }
        catch (e) { prompt('Copy the materials summary below:', text); }
    });

    // Export bundle
    exportBtn.addEventListener('click', () => {
        const bundle = { configs: loadSaved(), inventory: loadInventory() };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'stella_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    // Materials view mode
    btnTotal.addEventListener('click', () => setMaterialsViewMode('total'));
    btnRemaining.addEventListener('click', () => setMaterialsViewMode('remaining'));

    // Sort and filter events
    const sortSelect = $('#sortCharactersSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', populateModalCharacters);
    }

    listSearch.addEventListener('input', populateModalCharacters);

    FILTERS_FOR_LIST.forEach(f => {
        const filterEl = $(`#${f.id}`);
        if (filterEl) {
            filterEl.addEventListener('change', populateModalCharacters);
        }
    });
}

/* ---------------------------
   Theme handling (dark default)
----------------------------*/
function applySavedTheme() { const saved = localStorage.getItem(THEME_KEY); if (saved === 'light') { document.body.classList.add('light'); themeToggle.textContent = '☀️'; } else { document.body.classList.remove('light'); themeToggle.textContent = '🌙'; } }

/* ---------------------------
   Copy Summary (uses materials view mode)
----------------------------*/
function buildMaterialsText(mode) {
    const arr = computeCombinedTotals().sort((a, b) => (a.name || '').localeCompare(b.name));
    const inv = loadInventory();
    let text = 'Stella Sora — Materials Summary\n\n';
    arr.forEach(it => {
        let count = it.count || 0;
        if (mode === 'remaining') {
            const invCount = (inv.counts && inv.counts[it.name]) ? Number(inv.counts[it.name]) : 0;
            count = Math.max(0, count - invCount);
            if (count <= 0) return;
        }
        text += `${it.name}: ${count}\n`;
    });
    return text;
}

/* ---------------------------
   Initialize
----------------------------*/
function init() {
    applySavedTheme();
    setupEventListeners();
    renderSavedCharacters();
    renderMaterials(getMaterialsViewMode());
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);