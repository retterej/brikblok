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

async function importXmlSets() {
  const xmlData = await fs.readFile('data/sets.xml', 'utf8');
  const sets = await loadSets();
  
  // Extract set numbers from XML
  const setMatches = xmlData.match(/<ITEMID>([^<]+)<\/ITEMID>/g);
  const setNumbers = setMatches.map(match => match.replace(/<\/?ITEMID>/g, ''));
  
  console.log(`Found ${setNumbers.length} sets in XML`);
  
  for (const setNumber of setNumbers) {
    if (sets[setNumber]) {
      console.log(`⏭️  Skipped: ${setNumber} (already exists)`);
      continue;
    }
    
    try {
      const response = await blRequest("GET", `/items/SET/${setNumber}`);
      const setData = response.data;
      
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
      
      console.log(`✅ Added: ${setData.name} (${setNumber})`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await saveSets(sets);
  console.log(`\n🎉 XML import complete! Total sets: ${Object.keys(sets).length}`);
}

importXmlSets();