import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

const DB_FILE = 'lego_sets.json';

async function loadSets() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSets(sets) {
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
}

async function bulkAddSets() {
  const setNumbers = await fs.readFile('add_sets.txt', 'utf8');
  const sets = await loadSets();
  
  for (const setNumber of setNumbers.trim().split('\n')) {
    try {
      const response = await blRequest("GET", `/items/SET/${setNumber}`);
      const setData = response.data;
      
      // Create unique key for duplicates
      let key = setNumber;
      let counter = 1;
      while (sets[key]) {
        key = `${setNumber}_dup${counter}`;
        counter++;
      }
      
      sets[key] = {
        no: setData.no,
        name: setData.name,
        type: setData.type,
        category_id: setData.category_id,
        year_released: setData.year_released,
        weight: setData.weight,
        dim_x: setData.dim_x,
        dim_y: setData.dim_y,
        dim_z: setData.dim_z,
        condition: 'new',
        added_at: new Date().toISOString()
      };
      
      console.log(`✅ Added: ${setData.name} (${key})`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await saveSets(sets);
  console.log(`\n🎉 Bulk add complete! Total sets: ${Object.keys(sets).length}`);
}

bulkAddSets();