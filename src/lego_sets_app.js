import { blRequest } from "./bl_client.js";
import fs from "fs/promises";
import path from "path";

const DB_FILE = "lego_sets.json";

async function loadSets() {
  try {
    const data = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSets(sets) {
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
}

async function addSet(setNumber) {
  try {
    // Fetch set details from BrickLink
    const response = await blRequest("GET", `/items/SET/${setNumber}`);
    const setData = response.data;
    
    // Load existing sets
    const sets = await loadSets();
    
    // Store set with key as set number
    sets[setNumber] = {
      no: setData.no,
      name: setData.name,
      type: setData.type,
      category_id: setData.category_id,
      year_released: setData.year_released,
      weight: setData.weight,
      dim_x: setData.dim_x,
      dim_y: setData.dim_y,
      dim_z: setData.dim_z,
      added_at: new Date().toISOString()
    };
    
    await saveSets(sets);
    console.log(`✅ Added: ${setData.name} (${setNumber})`);
    return setData;
  } catch (error) {
    console.error(`❌ Failed to add set ${setNumber}:`, error.message);
    throw error;
  }
}

async function listSets() {
  const sets = await loadSets();
  const setList = Object.values(sets);
  
  if (setList.length === 0) {
    console.log("No sets stored yet.");
    return;
  }
  
  console.log(`\n📦 Stored Sets (${setList.length}):\n`);
  setList.forEach(set => {
    console.log(`${set.no} - ${set.name} (${set.year_released})`);
  });
}

async function getSet(setNumber) {
  const sets = await loadSets();
  const set = sets[setNumber];
  
  if (!set) {
    console.log(`Set ${setNumber} not found in collection.`);
    return null;
  }
  
  console.log(JSON.stringify(set, null, 2));
  return set;
}

// CLI interface
const [,, command, setNumber] = process.argv;

switch (command) {
  case "add":
    if (!setNumber) {
      console.log("Usage: node lego_sets_app.js add <set-number>");
      process.exit(1);
    }
    await addSet(setNumber);
    break;
    
  case "list":
    await listSets();
    break;
    
  case "get":
    if (!setNumber) {
      console.log("Usage: node lego_sets_app.js get <set-number>");
      process.exit(1);
    }
    await getSet(setNumber);
    break;
    
  default:
    console.log(`
LEGO Sets Manager

Commands:
  add <set-number>   Add a set by number (e.g., 10276-1)
  list              List all stored sets
  get <set-number>   Show details for a specific set

Examples:
  node lego_sets_app.js add 10276-1
  node lego_sets_app.js list
  node lego_sets_app.js get 10276-1
`);
}