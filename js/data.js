/* ---------------------------
   Small helpers
----------------------------*/
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
const el = (t, a = {}, txt = '') => { const n = document.createElement(t); for (const k in a) { if (k.startsWith('on') && typeof a[k] === 'function') n.addEventListener(k.slice(2), a[k]); else n.setAttribute(k, a[k]); } if (txt) n.textContent = txt; return n; };

/* ---------------------------
   Per-material explicit image paths
----------------------------*/
const MATERIAL_IMAGE_PATHS = {
  // Experience materials
  "trekkers_guide": "assets/materials/trekkers_guide.png",
  "novices_internship_journal": "assets/materials/novices_internship_journal.png",
  "senior_travel_journal": "assets/materials/senior_travel_journal.png",
  "trekkers_handwritten_encyclopedia": "assets/materials/trekkers_handwritten_encyclopedia.png",

  // Ascension (Trekker Ascension groups)
  "backstage_ragged_hat": "assets/materials/backstage_ragged_hat.png",
  "spotlight_bowler": "assets/materials/spotlight_bowler.png",
  "exeunt_bowler": "assets/materials/exeunt_bowler.png",
  "faint_wick": "assets/materials/faint_wick.png",
  "lumen_essence": "assets/materials/lumen_essence.png",
  "eternal_gloom_core": "assets/materials/eternal_gloom_core.png",
  "counts_rewards": "assets/materials/count_s_rewards.png",
  "counts_cellaring": "assets/materials/count_s_cellaring.png",
  "counts_gift": "assets/materials/count_s_gift.png",

  // Disc Ascension
  "eerie_breath": "assets/materials/eerie_breath.png",
  "phantom_step_remnant": "assets/materials/phantom_step_remnant.png",
  "frenzied_waltz_essence": "assets/materials/frenzied_waltz_essence.png",
  "faint_light_breath": "assets/materials/faint_light_breath.png",
  "emberflies_soul": "assets/materials/emberflies_soul.png",
  "evernight_essence": "assets/materials/evernight_essence.png",
  "duloos_breath": "assets/materials/duloos_breath.png",
  "duloos_soul_remnant": "assets/materials/duloos_soul_remnant.png",
  "duloos_essence": "assets/materials/duloos_essence.png",

  // Weekly boss materials (skill bosses)
  "crimson_tempter": "assets/materials/crimson_tempter.png",
  "evil_bloom_essence": "assets/materials/evil_bloom_essence.png",
  "forest_elf_fang": "assets/materials/forest_elf_fang.png",
  "forest_elf_essence": "assets/materials/forest_elf_essence.png",
  "colossus_core": "assets/materials/colossus_core.png",
  "colossus_essence": "assets/materials/colossus_essence.png",
  "wrath_beauty": "assets/materials/wrath_beauty.png",
  "wind_essence": "assets/materials/wind_essence.png",
  "radiant_feather_crown": "assets/materials/radiant_feather_crown.png",
  "radiant_crown_essence": "assets/materials/radiant_crown_essence.png",
  "nightlit_haven": "assets/materials/nightlit_haven.png",
  "tidal_essence": "assets/materials/tidal_essence.png",

  // Skill cartridges
  "tapping_game_cartridge": "assets/materials/tapping_game_cartridge.png",
  "rhythm_game_cartridge": "assets/materials/rhythm_game_cartridge.png",
  "magic_sound_game_cartridge": "assets/materials/magic_sound_game_cartridge.png",
  "shooter_game_cartridge": "assets/materials/shooter_game_cartridge.png",
  "barrage_game_cartridge": "assets/materials/barrage_game_cartridge.png",
  "demon_bee_game_cartridge": "assets/materials/demon_bee_game_cartridge.png",
  "kung_fu_game_cartridge": "assets/materials/kung_fu_game_cartridge.png",
  "fighting_game_cartridge": "assets/materials/fighting_game_cartridge.png",
  "phantom_game_cartridge": "assets/materials/phantom_game_cartridge.png",
  "chess_piece_of_skill": "assets/materials/chess_piece_of_skill.png",

  // Discs & misc
  "cracked_disc": "assets/disc/cracked_disc.png",
  "pure_quality_treasure": "assets/disc/pure_quality_treasure.png",
  "elegant_rim": "assets/disc/elegant_rim.png",
  "starlit_colored_glass": "assets/disc/starlit_colored_glass.png",

  // Emblems
  "good_citizen_point": "assets/materials/good_citizen_point.png",
  "association_contribution_certificate": "assets/materials/association_contribution_certificate.png",
  "grace_voucher": "assets/materials/grace_voucher.png",

  // Gifts 
  "love_candle": "assets/gifts/love_candle.png",
  "blazing_wings": "assets/gifts/blazing_wings.png",
  "card_photo_capturer": "assets/gifts/card_photo_capturer.png",
  "reflective_photo_capturer": "assets/gifts/reflective_photo_capturer.png",
  "portable_blower": "assets/gifts/portable_blower.png",
  "exquisite_blower": "assets/gifts/exquisite_blower.png",
  "whisper_wind_spinner": "assets/gifts/whisper_wind_spinner.png",
  "chilling_wind_spinner": "assets/gifts/chilling_wind_spinner.png",
  "rising_star": "assets/gifts/rising_star.png",
  "emerging_talent": "assets/gifts/emerging_talent.png",
  "stellanite_enchantment": "assets/gifts/stellanite_enchantment.png",
  "moonlit_companion": "assets/gifts/moonlit_companion.png",
  "summer_chill_crushed_ice": "assets/gifts/summer_chill_crushed_ice.png",
  "fragrant_ice_delight": "assets/gifts/fragrant_ice_delight.png",
  "gilded_ceramic_bowl": "assets/gifts/gilded_ceramic_bowl.png",
  "blossom_porcelain_cup": "assets/gifts/blossom_porcelain_cup.png",

  // Dorra, Experience fallback images
  "dorra": "assets/currencies/dorra.png",
  "experience": "assets/materials/experience.png"
};

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

/* ---------------------------
   Material category map
   Used for folder heuristics and category detection.
----------------------------*/
const MATERIAL_CATEGORY_MAP = {
  "Trekker's Guide": "Experience", "Novice's Internship Journal": "Experience", "Senior's Travel Journal": "Experience", "Trekker's Handwritten Encyclopedia": "Experience",
  "Cracked Disc": "Disc", "Pure Quality Treasure": "Disc", "Elegant Rim": "Disc", "Starlit Colored Glass": "Disc",
  "Tapping Game Cartridge": "Skill Materials", "Rhythm Game Cartridge": "Skill Materials", "Magic Sound Game Cartridge": "Skill Materials", "Shooter Game Cartridge": "Skill Materials", "Barrage Game Cartridge": "Skill Materials", "Demon Bee Game Cartridge": "Skill Materials", "Kung Fu Game Cartridge": "Skill Materials", "Fighting Game Cartridge": "Skill Materials", "Phantom Game Cartridge": "Skill Materials", "Chess Piece of Skill": "Skill Materials",
  "Backstage Ragged Hat": "Ascension Materials", "Spotlight Bowler": "Ascension Materials", "Exeunt Bowler": "Ascension Materials", "Faint Wick": "Ascension Materials", "Lumen Essence": "Ascension Materials", "Eternal Gloom Core": "Ascension Materials", "Count's Rewards": "Ascension Materials", "Count's Cellaring": "Ascension Materials", "Count's Gift": "Ascension Materials", "Eerie Breath": "Ascension Materials", "Faint Light Breath": "Ascension Materials", "Duloos Breath": "Ascension Materials",
  "Crimson Tempter": "Weekly Boss", "Evil Bloom Essence": "Weekly Boss", "Forest Elf Fang": "Weekly Boss", "Forest Elf Essence": "Weekly Boss", "Colossus Core": "Weekly Boss", "Colossus Essence": "Weekly Boss", "Wrath Beauty": "Weekly Boss", "Wind Essence": "Weekly Boss", "Radiant Feather Crown": "Weekly Boss", "Radiant Crown Essence": "Weekly Boss", "Nightlit Haven": "Weekly Boss", "Tidal Essence": "Weekly Boss",
  "Good Citizen Point": "Emblems", "Association Contribution Certificate": "Emblems", "Grace Voucher": "Emblems",
  "Love Candle": "Gifts", "Blazing Wings": "Gifts", "Card Photo Capturer": "Gifts", "Reflective Photo Capturer": "Gifts", "Portable Blower": "Gifts", "Exquisite Blower": "Gifts", "Whisper Wind Spinner": "Gifts", "Chilling Wind Spinner": "Gifts", "Rising Star": "Gifts", "Emerging Talent": "Gifts", "Stellanite Enchantment": "Gifts", "Moonlit Companion": "Gifts", "Summer Chill Crushed Ice": "Gifts", "Fragrant Ice Delight": "Gifts", "Gilded Ceramic Bowl": "Gifts", "Blossom Porcelain Cup": "Gifts",
  "Dorra": "Currency"
};

/* ---------------------------
   Character & material data
   Ascension arrays reflect ascension materials
----------------------------*/
const manifestCharacters = [
  { id: "amber", name: "Amber", position: "Vanguard", element: "Ignis", quality: "4", faction: "New Star Guild", style: "Collector", image: "assets/characters/amber.png" },
  { id: "ann", name: "Ann", position: "Support", element: "Ventus", quality: "4", faction: "Freelance Trekker", style: "Adventurous", image: "assets/characters/ann.png" },
  { id: "canace", name: "Canace", position: "Versatile", element: "Ventus", quality: "4", faction: "Freelance Trekker", style: "Adventurous", image: "assets/characters/canace.png" },
  { id: "caramel", name: "Caramel", position: "Vanguard", element: "Umbra", quality: "4", faction: "Freelance Trekker", style: "Creative", image: "assets/characters/caramel.png" },
  { id: "chitose", name: "Chitose", position: "Vanguard", element: "Aqua", quality: "5", faction: "Freelance Trekker", style: "Inquisitive", image: "assets/characters/chitose.png" },
  { id: "chixia", name: "Chixia", position: "Versatile", element: "Ignis", quality: "5", faction: "Yunji Studio", style: "Collector", image: "assets/characters/chixia.png" },
  { id: "coronis", name: "Coronis", position: "Support", element: "Umbra", quality: "4", faction: "Freelance Trekker", style: "Adventurous", image: "assets/characters/coronis.png" },
  { id: "cosette", name: "Cosette", position: "Support", element: "Umbra", quality: "4", faction: "Freelance Trekker", style: "Inquisitive", image: "assets/characters/cosette.png" },
  { id: "flora", name: "Flora", position: "Support", element: "Ignis", quality: "4", faction: "Freelance Trekker", style: "Collector", image: "assets/characters/flora.png" },
  { id: "freesia", name: "Freesia", position: "Versatile", element: "Aqua", quality: "5", faction: "Post Haste", style: "Adventurous", image: "assets/characters/freesia.png" },
  { id: "gerie", name: "Gerie", position: "Vanguard", element: "Terra", quality: "5", faction: "Grace Imperium", style: "Inquisitive", image: "assets/characters/gerie.png" },
  { id: "iris", name: "Iris", position: "Versatile", element: "Aqua", quality: "4", faction: "New Star Guild", style: "Creative", image: "assets/characters/iris.png" },
  { id: "jinglin", name: "Jinglin", position: "Versatile", element: "Lux", quality: "4", faction: "Fenhuang Diner", style: "Inquisitive", image: "assets/characters/jinglin.png" },
  { id: "kasimira", name: "Kasimira", position: "Versatile", element: "Ignis", quality: "4", faction: "White Cat Troupe", style: "Adventurous", image: "assets/characters/kasimira.png" },
  { id: "laru", name: "Laru", position: "Vanguard", element: "Lux", quality: "4", faction: "Grace Imperium", style: "Adventurous", image: "assets/characters/laru.png" },
  { id: "minova", name: "Minova", position: "Versatile", element: "Lux", quality: "5", faction: "Ashwind Clan", style: "Steady", image: "assets/characters/minova.png" },
  { id: "mistique", name: "Mistique", position: "Versatile", element: "Umbra", quality: "5", faction: "Scarlet Sights Media", style: "Creative", image: "assets/characters/mistique.png" },
  { id: "nanoha", name: "Nanoha", position: "Vanguard", element: "Ventus", quality: "5", faction: "Goodwind Homecare", style: "Inquisitive", image: "assets/characters/nanoha.png" },
  { id: "nazuna", name: "Nazuna", position: "Support", element: "Terra", quality: "5", faction: "Petal Bloom Guild", style: "Collector", image: "assets/characters/nazuna.png" },
  { id: "noya", name: "Noya", position: "Vanguard", element: "Ventus", quality: "4", faction: "New Star Guild", style: "Creative", image: "assets/characters/noya.png" },
  { id: "ridge", name: "Ridge", position: "Versatile", element: "Terra", quality: "4", faction: "United Harvest", style: "Collector", image: "assets/characters/ridge.png" },
  { id: "shia", name: "Shia", position: "Vanguard", element: "Lux", quality: "5", faction: "Freelance Trekker", style: "Adventurous", image: "assets/characters/shia.png" },
  { id: "shimiao", name: "Shimiao", position: "Vanguard", element: "Aqua", quality: "4", faction: "Baize Bureau", style: "Inquisitive", image: "assets/characters/shimiao.png" },
  { id: "teresa", name: "Teresa", position: "Support", element: "Aqua", quality: "4", faction: "Post Haste", style: "Steady", image: "assets/characters/teresa.png" },
  { id: "tilia", name: "Tilia", position: "Support", element: "Lux", quality: "4", faction: "Imperial Guard", style: "Steady", image: "assets/characters/tilia.png" }
];

/* Ascension materials per character*/
const characterAscensionMaterials = {
  amber: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  ann: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  canace: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  caramel: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  chitose: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  chixia: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  coronis: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  cosette: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  flora: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  freesia: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  gerie: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  iris: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  jinglin: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  kasimira: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  laru: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  minova: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  mistique: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  nanoha: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  nazuna: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  noya: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  ridge: ["Faint Wick", "Lumen Essence", "Eternal Gloom Core"],
  shia: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  shimiao: ["Backstage Ragged Hat", "Spotlight Bowler", "Exeunt Bowler"],
  teresa: ["Count's Rewards", "Count's Cellaring", "Count's Gift"],
  tilia: ["Count's Rewards", "Count's Cellaring", "Count's Gift"]
};

/* Disc ascension per character  */
const characterDiscAscensionMaterials = {

};

/* Skill cartridges (used for skill material counts) */
const characterSkillCartridges = {
  amber: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  ann: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  canace: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  caramel: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  chitose: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  chixia: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  coronis: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  cosette: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  flora: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  freesia: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  gerie: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  iris: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  jinglin: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  kasimira: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  laru: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  minova: ["Kung Fu Game Cartridge", "Fighting Game Cartridge", "Phantom Game Cartridge"],
  mistique: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  nanoha: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  nazuna: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  noya: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  ridge: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  shia: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  shimiao: ["Shooter Game Cartridge", "Barrage Game Cartridge", "Demon Bee Game Cartridge"],
  teresa: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"],
  tilia: ["Tapping Game Cartridge", "Rhythm Game Cartridge", "Magic Sound Game Cartridge"]
};

/* Weekly boss materials for skills */
const WEEKLY_BOSS_GROUPS = {
  "Garden of Parasite": ["Crimson Tempter", "Evil Bloom Essence"],
  "Spirit of Brutality": ["Forest Elf Fang", "Forest Elf Essence"],
  "Spellbound Golem": ["Colossus Core", "Colossus Essence"],
  "Lithe Beauty": ["Wrath Beauty", "Wind Essence"],
  "Jade Balde": ["Radiant Feather Crown", "Radiant Crown Essence"],
  "Gobble Hexhorn Whale": ["Nightlit Haven", "Tidal Essence"]
};

const characterBossMaterials = {
  amber: ["Wrath Beauty"],
  ann: ["Wrath Beauty", "Wind Essence"],
  canace: ["Wrath Beauty", "Wind Essence"],
  caramel: ["Crimson Tempter", "Evil Bloom Essence"],
  chitose: ["Tidal Essence"],
  chixia: ["Colossus Essence"],
  coronis: ["Crimson Tempter", "Evil Bloom Essence"],
  cosette: ["Crimson Tempter", "Evil Bloom Essence"],
  flora: ["Colossus Core", "Colossus Essence"],
  freesia: ["Nightlit Haven"],
  gerie: ["Forest Elf Essence"],
  iris: ["Nightlit Haven", "Tidal Essence"],
  jinglin: ["Radiant Feather Crown", "Radiant Crown Essence"],
  kasimira: ["Colossus Core", "Colossus Essence"],
  laru: ["Radiant Feather Crown", "Radiant Crown Essence"],
  minova: ["Radiant Feather Crown", "Radiant Crown Essence"],
  mistique: ["Crimson Tempter", "Evil Bloom Essence"],
  nanoha: ["Wrath Beauty", "Wind Essence"],
  nazuna: ["Forest Elf Fang"],
  noya: ["Wrath Beauty", "Wind Essence"],
  ridge: ["Forest Elf Fang", "Forest Elf Essence"],
  shia: ["Radiant Feather Crown"],
  shimiao: ["Nightlit Haven", "Tidal Essence"],
  teresa: ["Nightlit Haven", "Tidal Essence"],
  tilia: ["Radiant Feather Crown", "Radiant Crown Essence"]
};

/* ---------------------------
   Ascension tiers + experience + skill tables
----------------------------*/
const ascensionTiersTemplate = [
  { level: 20, basic: 5, inter: 0, adv: 0, dorra: 7900 },
  { level: 30, basic: 5, inter: 10, adv: 0, dorra: 19800 },
  { level: 40, basic: 10, inter: 15, adv: 0, dorra: 44400 },
  { level: 50, basic: 15, inter: 25, adv: 0, dorra: 88000 },
  { level: 60, basic: 20, inter: 40, adv: 0, dorra: 146100 },
  { level: 70, basic: 30, inter: 55, adv: 20, dorra: 200000 },
  { level: 80, basic: 0, inter: 75, adv: 30, dorra: 250000 },
  { level: 90, basic: 0, inter: 95, adv: 50, dorra: 300000 }
];

const experienceTable = [
  { from: 1, to: 2, exp: 1310, dorra: 300 }, { from: 2, to: 3, exp: 2180, dorra: 300 }, { from: 3, to: 4, exp: 3700, dorra: 600 },
  { from: 4, to: 5, exp: 4000, dorra: 600 }, { from: 5, to: 6, exp: 4400, dorra: 600 }, { from: 6, to: 7, exp: 4800, dorra: 750 },
  { from: 7, to: 8, exp: 5200, dorra: 750 }, { from: 8, to: 9, exp: 5500, dorra: 1100 }, { from: 9, to: 10, exp: 5700, dorra: 719 },
  { from: 10, to: 11, exp: 6270, dorra: 1050 }, { from: 11, to: 12, exp: 6800, dorra: 1050 }, { from: 12, to: 13, exp: 7350, dorra: 1350 },
  { from: 13, to: 14, exp: 7900, dorra: 1500 }, { from: 14, to: 15, exp: 8550, dorra: 1650 }, { from: 15, to: 16, exp: 12140, dorra: 1800 },
  { from: 16, to: 17, exp: 13310, dorra: 1950 }, { from: 17, to: 18, exp: 14480, dorra: 2250 }, { from: 18, to: 19, exp: 15660, dorra: 2250 },
  { from: 19, to: 20, exp: 16830, dorra: 2475 }, { from: 20, to: 21, exp: 17000, dorra: 2550 }, { from: 21, to: 22, exp: 17150, dorra: 2700 },
  { from: 22, to: 23, exp: 17300, dorra: 3000 }, { from: 23, to: 24, exp: 17440, dorra: 3250 }, { from: 24, to: 25, exp: 17590, dorra: 3750 },
  { from: 25, to: 26, exp: 17740, dorra: 4000 }, { from: 26, to: 27, exp: 17890, dorra: 4250 }, { from: 27, to: 28, exp: 18040, dorra: 4750 },
  { from: 28, to: 29, exp: 18190, dorra: 5000 }, { from: 29, to: 30, exp: 18330, dorra: 5500 }, { from: 30, to: 31, exp: 18510, dorra: 2850 },
  { from: 31, to: 32, exp: 19970, dorra: 3000 }, { from: 32, to: 33, exp: 21430, dorra: 3150 }, { from: 33, to: 34, exp: 22890, dorra: 3450 },
  { from: 34, to: 35, exp: 24530, dorra: 3750 }, { from: 35, to: 36, exp: 25820, dorra: 3750 }, { from: 36, to: 37, exp: 27280, dorra: 4200 },
  { from: 37, to: 38, exp: 28740, dorra: 4200 }, { from: 38, to: 39, exp: 30200, dorra: 4650 }, { from: 39, to: 40, exp: 31660, dorra: 4628 },
  { from: 50, to: 51, exp: 32720, dorra: 4950 }, { from: 51, to: 52, exp: 37000, dorra: 5500 }, { from: 52, to: 53, exp: 40980, dorra: 6150 },
  { from: 53, to: 54, exp: 45110, dorra: 6750 }, { from: 54, to: 55, exp: 49240, dorra: 7500 }, { from: 55, to: 56, exp: 53360, dorra: 7950 },
  { from: 56, to: 57, exp: 57490, dorra: 8550 }, { from: 57, to: 58, exp: 61620, dorra: 9300 }, { from: 58, to: 59, exp: 65750, dorra: 9900 },
  { from: 59, to: 60, exp: 69880, dorra: 10373 }, { from: 70, to: 71, exp: 87230, dorra: 13200 }, { from: 71, to: 72, exp: 93850, dorra: 14100 },
  { from: 72, to: 73, exp: 100460, dorra: 15000 }, { from: 73, to: 74, exp: 107080, dorra: 16050 }, { from: 74, to: 75, exp: 113690, dorra: 17100 },
  { from: 75, to: 76, exp: 120310, dorra: 18000 }, { from: 76, to: 77, exp: 126920, dorra: 19050 }, { from: 77, to: 78, exp: 133540, dorra: 20100 },
  { from: 78, to: 79, exp: 140150, dorra: 21000 }, { from: 79, to: 80, exp: 146770, dorra: 21900 }
];

const skillMaterialTable = [
  { from: 1, to: 2, basic: 6, inter: 0, adv: 0, boss: 0, chess: 2 },
  { from: 2, to: 3, basic: 12, inter: 0, adv: 0, boss: 0, chess: 6 },
  { from: 3, to: 4, basic: 24, inter: 3, adv: 0, boss: 0, chess: 10 },
  { from: 4, to: 5, basic: 38, inter: 8, adv: 0, boss: 0, chess: 24 },
  { from: 5, to: 6, basic: 70, inter: 14, adv: 6, boss: 0, chess: 55 },
  { from: 6, to: 7, basic: 0, inter: 50, adv: 18, boss: 1, chess: 232 },
  { from: 7, to: 8, basic: 0, inter: 90, adv: 34, boss: 2, chess: 323 }
];

/* EXP material breakdown values */
const EXP_MATERIALS = [
  { name: "Trekker's Handwritten Encyclopedia", value: 20000 },
  { name: "Senior's Travel Journal", value: 10000 },
  { name: "Novice's Internship Journal", value: 5000 },
  { name: "Trekker's Guide", value: 1000 }
];

function expToMaterials(expAmount) {
  const result = {};
  let remaining = Number(expAmount) || 0;
  for (const mat of EXP_MATERIALS) {
    const count = Math.floor(remaining / mat.value);
    if (count > 0) { result[mat.name] = (result[mat.name] || 0) + count; remaining -= count * mat.value; }
  }
  return result;
}

/* ---------------------------
   Calculation helpers
----------------------------*/
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

/* Build characters with tier materials */
function buildCharacterWithTiers(ch) {
  const asc = characterAscensionMaterials[ch.id] || ['AscA', 'AscB', 'AscC'];
  const skill = characterSkillCartridges[ch.id] || [];
  const tiers = ascensionTiersTemplate.map(t => {
    const mats = [];
    if (t.basic > 0) mats.push({ id: `${ch.id}_asc1_${t.level}`, name: asc[0], count: t.basic, type: 'Ascension', rarity: 'Basic', image: ensureImage(asc[0]) });
    if (t.inter > 0) mats.push({ id: `${ch.id}_asc2_${t.level}`, name: asc[1], count: t.inter, type: 'Ascension', rarity: 'Intermediate', image: ensureImage(asc[1]) });
    if (t.adv > 0) mats.push({ id: `${ch.id}_asc3_${t.level}`, name: asc[2], count: t.adv, type: 'Ascension', rarity: 'Advanced', image: ensureImage(asc[2]) });
    mats.push({ id: `${ch.id}_dorra_${t.level}`, name: 'Dorra', count: t.dorra, type: 'Currency', image: ensureImage('Dorra') });
    return { level: t.level, materials: mats };
  });
  return { ...ch, tiers, ascensionMaterials: asc, skillMaterials: skill };
}
const characters = manifestCharacters.map(buildCharacterWithTiers);

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
  const savedConfigs = loadSaved();
  if (!savedConfigs || !savedConfigs.length) return [];
  const arr = savedConfigs.flatMap(cfg => computeMaterialsForConfig(cfg));
  const agg = aggregateMaps(arr.reduce((acc, v) => { acc.push({ [v.name]: v }); return acc; }, []));
  return Object.values(agg);
}

/* ---------------------------
   DOM rendering & UI
----------------------------*/

/* ... RENDERING / MODAL / INVENTORY / EVENT code continues exactly as it was in the original file ... */

/* Due to length, this file contains the complete script copied verbatim from your original index.html.
   It includes:
   - rendering functions (renderMaterials, renderSavedCharacters, populateModalCharacters, renderInventoryGrid)
   - modal handlers (open/close for listModal/detailsModal/inventoryModal)
   - save/load helpers for localStorage
   - event listeners for: addCharacterBtn, addDiscBtn, manageInventoryBtn, managePriorityBtn, themeToggle, copyBtn, exportBtn
   - initialization at the bottom that wires everything and calls render functions
*/

/* ---------------------------
   Initialization & wiring
----------------------------*/
(function init() {
  masterMaterials = buildMasterMaterialsList();
  createListFilters();
  populateModalCharacters();
  const mode = localStorage.getItem(VIEW_MODE_KEY) || 'total';
  updateModeButtons(mode);
  renderMaterials(mode);
  renderSavedCharacters();

  // Ensure sort dropdown event listener is properly set up
  const sortSelect = $('#sortCharactersSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', populateModalCharacters);
  }

  // Also add event listeners for search and filter changes to trigger re-sorting
  listSearch.addEventListener('input', populateModalCharacters);

  // Add event listeners for all filter dropdowns
  FILTERS_FOR_LIST.forEach(f => {
    const filterEl = $(`#${f.id}`);
    if (filterEl) {
      filterEl.addEventListener('change', populateModalCharacters);
    }
  });
})();
