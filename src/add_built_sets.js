import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

const DB_FILE = 'lego_sets.json';

async function addBuiltSets() {
  const setNumbers = await fs.readFile('new_built_sets.txt', 'utf8');
  const sets = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  const newSets = [];
  
  for (const setNumber of setNumbers.trim().split('\n')) {
    if (sets[setNumber]) {
      console.log(`\n⚠️  DUPLICATE FOUND: ${setNumber} - ${sets[setNumber].name}`);
      console.log('This set already exists in your collection.');
      console.log('Options: [s]kip, [a]dd as second copy, [r]eplace existing');
      // For now, skip - but next time we'll prompt for user input
      console.log('Skipping for now. Next time I\'ll ask what to do.');
      continue;
    }
    
    try {
      // Get basic set info
      const response = await blRequest("GET", `/items/SET/${setNumber}`);
      const setData = response.data;
      
      // Get category name
      const categoryResponse = await blRequest("GET", `/categories/${setData.category_id}`);
      const categoryName = categoryResponse.data.category_name;
      
      // Get piece counts and minifigs
      const subsetsResponse = await blRequest("GET", `/items/SET/${setNumber}/subsets`);
      const subsets = subsetsResponse.data;
      
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
      
      sets[setNumber] = {
        no: setData.no,
        name: setData.name,
        type: setData.type,
        category_id: setData.category_id,
        category_name: categoryName,
        year_released: setData.year_released,
        weight: setData.weight,
        dim_x: setData.dim_x,
        dim_y: setData.dim_y,
        dim_z: setData.dim_z,
        piece_count: partCount + minifigCount,
        part_count: partCount,
        minifig_count: minifigCount,
        minifigs: minifigs,
        condition: 'used',
        added_at: new Date().toISOString()
      };
      
      newSets.push(setNumber);
      console.log(`✅ Added: ${setData.name} (${setNumber}) - ${partCount + minifigCount} pieces, ${minifigCount} minifigs`);
      
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.log(`❌ Failed: ${setNumber} - ${error.message}`);
    }
  }
  
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
  
  // Create BrickLink XML for new sets
  let xml = '<INVENTORY>';
  for (const setNumber of newSets) {
    xml += `<ITEM><ITEMTYPE>S</ITEMTYPE><ITEMID>${setNumber}</ITEMID><COLOR>0</COLOR><QTY>1</QTY><CONDITION>U</CONDITION><SUBCONDITION>C</SUBCONDITION></ITEM>`;
  }
  xml += '</INVENTORY>';
  
  await fs.writeFile('new_built_sets.xml', xml);
  
  console.log(`\n🎉 Added ${newSets.length} new built sets`);
  console.log(`📄 Created new_built_sets.xml for BrickLink import`);
}

addBuiltSets();