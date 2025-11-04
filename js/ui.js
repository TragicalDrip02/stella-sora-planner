function calcAscensionMaterialsForChar(charId, currentLevel, desiredLevel) {
      const ch = characters.find(c => c.id === charId);
      if (!ch) return {};
      const tiers = ch.tiers.filter(t => t.level > currentLevel && t.level <= desiredLevel);
      const out = {};
      tiers.forEach(t => t.materials.forEach(m => {
        if (!out[m.name]) out[m.name] = { ...m };
        else out[m.name].count += m.count;
      }));
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

    const STORAGE_KEY = "stella_sora_saved";

    function load
