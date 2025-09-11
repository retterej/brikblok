import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

const DB_FILE = 'lego_sets.json';

async function addPieceCounts() {
  const sets = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  let updated = 0;
  
  for (const [setNumber, setData] of Object.entries(sets)) {
    if (setData.piece_count) {
      console.log(`⏭️  Skipped: ${setNumber} (already has piece count)`);
      continue;
    }
    
    try {
      const response = await blRequest("GET", `/items/SET/${setNumber}/subsets`);
      const subsets = response.data;
      
      let totalPieces = 0;
      for (const subset of subsets) {
        for (const entry of subset.entries) {
          totalPieces += entry.quantity;
        }
      }
      
      sets[setNumber].piece_count = totalPieces;
      console.log(`✅ ${setData.name} (${setNumber}): ${totalPieces} pieces`);
      updated++;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
  console.log(`\n🎉 Updated ${updated} sets with piece counts`);
}

addPieceCounts();