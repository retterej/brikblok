import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

const DB_FILE = 'lego_sets.json';

async function addMinifigDetails() {
  const sets = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  let updated = 0;
  
  for (const [setNumber, setData] of Object.entries(sets)) {
    if (setData.minifig_count !== undefined) {
      console.log(`⏭️  Skipped: ${setNumber} (already has minifig data)`);
      continue;
    }
    
    try {
      const response = await blRequest("GET", `/items/SET/${setNumber}/subsets`);
      const subsets = response.data;
      
      let partCount = 0;
      let minifigCount = 0;
      const minifigs = [];
      
      for (const subset of subsets) {
        for (const entry of subset.entries) {
          if (entry.item.type === 'PART') {
            partCount += entry.quantity;
          } else if (entry.item.type === 'MINIFIG') {
            minifigCount += entry.quantity;
            minifigs.push({
              name: entry.item.name,
              quantity: entry.quantity
            });
          }
        }
      }
      
      sets[setNumber].part_count = partCount;
      sets[setNumber].minifig_count = minifigCount;
      sets[setNumber].minifigs = minifigs;
      
      console.log(`✅ ${setData.name} (${setNumber}): ${partCount} parts, ${minifigCount} minifigs`);
      updated++;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
  console.log(`\n🎉 Updated ${updated} sets with minifig details`);
}

addMinifigDetails();