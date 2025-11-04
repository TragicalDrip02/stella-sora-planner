const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
    const el = (t, a = {}, txt = '') => { const n = document.createElement(t); for (const k in a) { if (k.startsWith('on') && typeof a[k] === 'function') n.addEventListener(k.slice(2), a[k]); else n.setAttribute(k, a[k]); } if (txt) n.textContent = txt; return n; };

    /* ---------------------------
       Per-material explicit image paths
    ----------------------------*/
    function safeKey(name) {
      if (!name) return '';
      return name.toString().toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }

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

    /* ---------------------------
       Helper: Calculate Skill Materials
    ----------------------------*/
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

    /* ---------------------------
       Helper: Calculate EXP and Dorra
    ----------------------------*/
    function calculateExperienceNeeded(current, desired) {
      let totalExp = 0, totalDorra = 0;
      if (Number(desired) <= Number(current)) return { totalExp: 0, totalDorra: 0 };
      for (const row of experienceTable)
        if (row.from >= Number(current) && row.to <= Number(desired)) {
          totalExp += row.exp || 0;
          totalDorra += row.dorra || 0;
        }
      return { totalExp, totalDorra };
    }

    /* ---------------------------
       Helper: Convert EXP amount to materials
    ----------------------------*/
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

    /* ---------------------------
       Aggregation helper
    ----------------------------*/
    function aggregateMaps(listOfMaps) {
      const out = {};
      listOfMaps.forEach(m => {
        for (const k in m) {
          if (!out[k]) out[k] = { ...m[k] };
          else out[k].count += m[k].count;
        }
      });
      return out;
    }

    /* ---------------------------
       Sorting helper
    ----------------------------*/
    function materialSort(a, b) {
      const an = a?.name || a || '';
      const bn = b?.name || b || '';
      return an.localeCompare(bn);
    }
