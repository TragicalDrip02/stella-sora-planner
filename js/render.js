/* ---------------------------
   Render materials summary (icons only)
----------------------------*/
const materialsGrid = $('#materialsGrid');
const btnTotal = $('#btnTotalNeeded'), btnRemaining = $('#btnRemainingNeeded');

function updateModeButtons(mode) {
    btnTotal.classList.toggle('active', mode === 'total');
    btnRemaining.classList.toggle('active', mode === 'remaining');
}

function renderMaterials(mode = 'total') {
    const arr = computeCombinedTotals();
    arr.sort(materialSort);
    const inv = loadInventory();
    materialsGrid.innerHTML = '';
    if (!arr.length) { materialsGrid.innerHTML = '<div class="small muted">Add characters to see totals.</div>'; return; }
    arr.forEach(it => {
        let count = it.count || 0;
        if (mode === 'remaining') {
            const invCount = (inv.counts && inv.counts[it.name]) ? Number(inv.counts[it.name]) : 0;
            count = Math.max(0, count - invCount);
            if (count <= 0) return;
        }
        const imgPath = ensureImage(it.image || it.name);
        const d = el('div', { class: 'material', 'data-tooltip': it.name || '' });
        d.innerHTML = `<img src="${imgPath}" alt="${it.name}"><div class="mat-count">${count}</div>`;
        materialsGrid.appendChild(d);
    });
}

/* ---------------------------
   Render saved characters
----------------------------*/
const characterGrid = $('#characterGrid');

function renderSavedCharacters() {
    characterGrid.innerHTML = '';
    const saved = loadSaved();
    const visible = saved.filter(cfg => !cfg.completed);
    if (!visible.length) { characterGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center" class="muted">No characters yet — click Add Character to begin.</div>'; return; }
    visible.forEach(cfg => {
        const ch = characters.find(c => c.id === cfg.charId); if (!ch) return;
        const card = el('div', { class: 'character-card card' });
        if (cfg.ignored) card.classList.add('dimmed');

        // top row
        const top = el('div', { class: 'char-top' });
        const leftA = el('div', { class: 'char-actions-left' });
        const editBtn = el('button', { class: 'icon-btn', title: 'Edit' }); editBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12V21h8.97L21 12.03 14.98 6 3 12z" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        editBtn.addEventListener('click', () => openDetailsForEdit(cfg.id));
        const completeBtn = el('button', { class: 'icon-btn', title: 'Complete' }); completeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 15l-3.5-3.5L6 13l4 4 8-8-1.5-1.5L10 15z" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        completeBtn.addEventListener('click', () => { if (!confirm(`Mark ${ch.name} as completed (assume materials collected)?`)) return; cfg.completed = true; addOrUpdate(cfg); renderSavedCharacters(); renderMaterials(getMaterialsViewMode()); populateModalCharacters(); });

        leftA.appendChild(editBtn); leftA.appendChild(completeBtn);

        const rightA = el('div', { class: 'char-actions-right' });
        const deleteBtn = el('button', { class: 'icon-btn', title: 'Delete' }); deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z M9 3h6l1 2H8l1-2z" stroke-width="1.2"/></svg>';
        deleteBtn.addEventListener('click', () => { if (!confirm(`Delete ${ch.name}?`)) return; removeConfig(cfg.id); renderSavedCharacters(); renderMaterials(getMaterialsViewMode()); populateModalCharacters(); });

        const hideBtn = el('button', { class: 'icon-btn', title: cfg.ignored ? 'Show' : 'Hide' });
        hideBtn.innerHTML = cfg.ignored ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z" stroke-width="1.2"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z" stroke-width="1.2"/></svg>';
        hideBtn.addEventListener('click', () => {
            cfg.ignored = !cfg.ignored;
            addOrUpdate(cfg);
            if (cfg.ignored) card.classList.add('dimmed'); else card.classList.remove('dimmed');
            hideBtn.title = cfg.ignored ? 'Show' : 'Hide';
            hideBtn.innerHTML = cfg.ignored ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z" stroke-width="1.2"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z" stroke-width="1.2"/></svg>';
            renderSavedCharacters(); renderMaterials(getMaterialsViewMode()); populateModalCharacters();
        });

        rightA.appendChild(deleteBtn); rightA.appendChild(hideBtn);

        const nameDiv = el('div', { class: 'char-name' }, ch.name);
        top.appendChild(leftA); top.appendChild(nameDiv); top.appendChild(rightA);
        card.appendChild(top);

        // body
        const body = el('div', { class: 'char-body' });
        const portrait = el('div', { class: 'char-portrait' }); portrait.style.backgroundImage = `url(${ch.image})`;
        const info = el('div', { class: 'char-info' });
        const lv = el('div', { class: 'char-levels' }); lv.innerHTML = `<div style="font-weight:700">Levels</div><div class="small">${cfg.currentLevel} → ${cfg.desiredLevel}</div>`;
        const skillsWrap = el('div', { class: 'char-skills' }); skillsWrap.innerHTML = `<div style="font-weight:700">Skills</div>`;
        const addSkillRow = (label, curv, desv) => { const row = el('div', { class: 'skill-row' }); row.innerHTML = `<div class="skill-label">${label}</div><div class="skill-values small">${curv} → ${desv}</div>`; skillsWrap.appendChild(row); };
        addSkillRow('Attack', cfg.atkCur, cfg.atkDes); addSkillRow('Main', cfg.mainCur, cfg.mainDes); addSkillRow('Support', cfg.supCur, cfg.supDes); addSkillRow('Ultimate', cfg.ultCur, cfg.ultDes);
        info.appendChild(lv); info.appendChild(skillsWrap);
        body.appendChild(portrait); body.appendChild(info);
        card.appendChild(body);

        // materials preview
        const mats = computeMaterialsForConfig(cfg);
        const matWrap = el('div', { class: 'char-materials' });
        mats.sort(materialSort).slice(0, 8).forEach(m => {
            const mm = el('div', { class: 'char-material', 'data-tooltip': m.name || '' });
            mm.innerHTML = `<img src="${ensureImage(m.image || m.name)}" alt="${m.name}"><div style="font-weight:700">${m.count}</div>`;
            matWrap.appendChild(mm);
        });

        // show weekly boss materials distinctly if character has weekly boss mapping
        const bossArr = (characterBossMaterials[ch.id] || []).map(n => ({ name: n, image: ensureImage(n) }));
        if (bossArr.length) {
            bossArr.forEach(bm => {
                const mm = el('div', { class: 'char-material', 'data-tooltip': bm.name || '' });
                mm.innerHTML = `<img src="${bm.image}" alt="${bm.name}">`;
                matWrap.appendChild(mm);
            });
        }

        card.appendChild(matWrap);
        characterGrid.appendChild(card);
    });
}