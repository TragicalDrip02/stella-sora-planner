/* ---------------------------
   Storage helpers
----------------------------*/
const STORAGE_KEY = 'stella_final_configs_v2';
const INVENTORY_KEY = 'STELLA_INVENTORY_DATA';
const THEME_KEY = 'STELLA_THEME_MODE';
const VIEW_MODE_KEY = 'STELLA_MATERIALS_VIEW_MODE';

const loadSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveAll = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const addOrUpdate = cfg => { const arr = loadSaved(); const idx = arr.findIndex(x => x.id === cfg.id); if (idx >= 0) arr[idx] = cfg; else arr.push(cfg); saveAll(arr); }
const removeConfig = id => saveAll(loadSaved().filter(x => x.id !== id));
const loadInventory = () => { try { return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}'); } catch (e) { return {}; } };
const saveInventory = obj => localStorage.setItem(INVENTORY_KEY, JSON.stringify(obj || {}));

function getMaterialsViewMode() { return localStorage.getItem(VIEW_MODE_KEY) || 'total'; }
function setMaterialsViewMode(m) { localStorage.setItem(VIEW_MODE_KEY, m); }