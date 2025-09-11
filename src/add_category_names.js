import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

const DB_FILE = 'lego_sets.json';

async function addCategoryNames() {
  const sets = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  const categoryCache = {};
  let updated = 0;
  
  for (const [setNumber, setData] of Object.entries(sets)) {
    if (setData.category_name) {
      console.log(`⏭️  Skipped: ${setNumber} (already has category name)`);
      continue;
    }
    
    try {
      const categoryId = setData.category_id;
      
      if (!categoryCache[categoryId]) {
        const response = await blRequest("GET", `/categories/${categoryId}`);
        categoryCache[categoryId] = response.data.category_name;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      sets[setNumber].category_name = categoryCache[categoryId];
      console.log(`✅ ${setData.name} (${setNumber}): ${categoryCache[categoryId]}`);
      updated++;
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
  console.log(`\n🎉 Updated ${updated} sets with category names`);
}

addCategoryNames();