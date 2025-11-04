/* ===========================================================
   data.js — manifest data, mappings, and tables
   =========================================================== */

/* Material image paths */
const MATERIAL_IMAGE_PATHS = {
  trekkers_guide: "assets/materials/trekkers_guide.png",
  novices_internship_journal: "assets/materials/novices_internship_journal.png",
  senior_travel_journal: "assets/materials/senior_travel_journal.png",
  trekkers_handwritten_encyclopedia: "assets/materials/trekkers_handwritten_encyclopedia.png",
  cracked_disc: "assets/disc/cracked_disc.png",
  pure_quality_treasure: "assets/disc/pure_quality_treasure.png",
  elegant_rim: "assets/disc/elegant_rim.png",
  starlit_colored_glass: "assets/disc/starlit_colored_glass.png",
  dorra: "assets/currencies/dorra.png",
};

/* Material category map */
const MATERIAL_CATEGORY_MAP = {
  "Trekker's Guide": "Experience",
  "Novice's Internship Journal": "Experience",
  "Senior's Travel Journal": "Experience",
  "Trekker's Handwritten Encyclopedia": "Experience",
  "Cracked Disc": "Disc",
  "Pure Quality Treasure": "Disc",
  "Elegant Rim": "Disc",
  "Starlit Colored Glass": "Disc",
  "Dorra": "Currency",
};

/* Character manifest (example truncated to key entries for brevity) */
const manifestCharacters = [
  { id: "amber", name: "Amber", element: "Ignis", quality: 4, faction: "New Star Guild", image: "assets/characters/amber.png" },
  { id: "ann", name: "Ann", element: "Ventus", quality: 4, faction: "Freelance Trekker", image: "assets/characters/ann.png" },
  { id: "caramel", name: "Caramel", element: "Umbra", quality: 4, faction: "Freelance Trekker", image: "assets/characters/caramel.png" },
  { id: "chixia", name: "Chixia", element: "Ignis", quality: 5, faction: "Yunji Studio", image: "assets/characters/chixia.png" },
  { id: "minova", name: "Minova", element: "Lux", quality: 5, faction: "Ashwind Clan", image: "assets/characters/minova.png" },
];

/* Character ascension materials (shortened) */
const characterAscensionMaterials = {
  amber: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  ann: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  caramel: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
};

/* Skill cartridges */
const characterSkillCartridges = {
  amber: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  ann: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  caramel: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
};

/* Weekly boss materials */
const WEEKLY_BOSS_GROUPS = {
  "Garden of Parasite": ["Crimson Tempter", "Evil Bloom Essence"],
  "Spirit of Brutality": ["Forest Elf Fang", "Forest Elf Essence"],
};

const characterBossMaterials = {
  amber: ["Wrath Beauty"],
  ann: ["Wrath Beauty", "Wind Essence"],
  caramel: ["Crimson Tempter", "Evil Bloom Essence"],
};

/* Tables */
const ascensionTiersTemplate = [
  { level: 20, basic: 5, inter: 0, adv: 0, dorra: 7900 },
  { level: 30, basic: 5, inter: 10, adv: 0, dorra: 19800 },
];

const experienceTable = [
  { from: 1, to: 2, exp: 1310, dorra: 300 },
  { from: 2, to: 3, exp: 2180, dorra: 300 },
];

const skillMaterialTable = [
  { from: 1, to: 2, basic: 6, inter: 0, adv: 0, boss: 0, chess: 2 },
  { from: 2, to: 3, basic: 12, inter: 0, adv: 0, boss: 0, chess: 6 },
];

/* EXP material breakdown values */
const EXP_MATERIALS = [
  { name: "Trekker's Handwritten Encyclopedia", value: 20000 },
  { name: "Senior's Travel Journal", value: 10000 },
  { name: "Novice's Internship Journal", value: 5000 },
  { name: "Trekker's Guide", value: 1000 },
];

/* Character builder */
function buildCharacterWithTiers(ch) {
  const asc = characterAscensionMaterials[ch.id] || [];
  const tiers = ascensionTiersTemplate.map((t) => {
    const mats = [];
    if (t.basic > 0) mats.push({ name: asc[0], count: t.basic, image: ensureImage(asc[0]) });
    if (t.inter > 0) mats.push({ name: asc[1], count: t.inter, image: ensureImage(asc[1]) });
    mats.push({ name: 'Dorra', count: t.dorra, image: ensureImage('Dorra') });
    return { level: t.level, materials: mats };
  });
  return { ...ch, tiers, ascensionMaterials: asc };
}

const characters = manifestCharacters.map(buildCharacterWithTiers);
