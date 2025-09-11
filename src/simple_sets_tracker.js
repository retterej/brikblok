import fs from 'fs/promises';

const DB_FILE = 'simple_sets.json';

async function loadSets() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSets(sets) {
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
}

async function addSet(setNumber) {
  const sets = await loadSets();
  if (!sets.includes(setNumber)) {
    sets.push(setNumber);
    await saveSets(sets);
    console.log(`✅ Added: ${setNumber}`);
  } else {
    console.log(`Already tracked: ${setNumber}`);
  }
}

async function listSets() {
  const sets = await loadSets();
  if (sets.length === 0) {
    console.log("No sets tracked yet.");
    return;
  }
  console.log(`\n📦 Tracked Sets (${sets.length}):\n`);
  sets.forEach(set => console.log(set));
}

async function removeSet(setNumber) {
  const sets = await loadSets();
  const filtered = sets.filter(s => s !== setNumber);
  if (filtered.length < sets.length) {
    await saveSets(filtered);
    console.log(`❌ Removed: ${setNumber}`);
  } else {
    console.log(`Not found: ${setNumber}`);
  }
}

const [,, command, setNumber] = process.argv;

switch (command) {
  case "add":
    if (!setNumber) {
      console.log("Usage: node simple_sets_tracker.js add <set-number>");
      process.exit(1);
    }
    await addSet(setNumber);
    break;
    
  case "list":
    await listSets();
    break;
    
  case "remove":
    if (!setNumber) {
      console.log("Usage: node simple_sets_tracker.js remove <set-number>");
      process.exit(1);
    }
    await removeSet(setNumber);
    break;
    
  default:
    console.log(`
Simple LEGO Sets Tracker

Commands:
  add <set-number>      Track a set number
  list                  List all tracked sets
  remove <set-number>   Remove a set from tracking

Examples:
  node simple_sets_tracker.js add 10276-1
  node simple_sets_tracker.js list
  node simple_sets_tracker.js remove 10276-1
`);
}