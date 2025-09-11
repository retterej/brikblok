import fs from 'fs/promises';
import { blRequest } from './bl_client.js';

async function createMinifigDatabase() {
  const sets = JSON.parse(await fs.readFile('lego_sets.json', 'utf8'));
  const minifigDatabase = {};
  const minifigToSets = {};
  
  for (const [setNumber, setData] of Object.entries(sets)) {
    if (!setData.minifigs || setData.minifigs.length === 0) continue;
    
    for (const minifig of setData.minifigs) {
      const minifigId = minifig.name;
      
      if (!minifigDatabase[minifigId]) {
        try {
          // Extract minifig number from name (usually at the end)
          const minifigMatch = minifigId.match(/([a-z]{2,3}\d{4}[a-z]?)/i);
          if (minifigMatch) {
            const minifigNo = minifigMatch[1];
            const response = await blRequest("GET", `/items/MINIFIG/${minifigNo}`);
            const minifigData = response.data;
            
            minifigDatabase[minifigId] = {
              no: minifigData.no,
              name: minifigData.name,
              category_id: minifigData.category_id,
              year_released: minifigData.year_released,
              image_url: minifigData.image_url
            };
            
            console.log(`✅ Added minifig: ${minifigData.name} (${minifigNo})`);
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            minifigDatabase[minifigId] = {
              name: minifigId,
              no: 'unknown'
            };
            console.log(`⚠️  No ID found for: ${minifigId}`);
          }
        } catch (error) {
          minifigDatabase[minifigId] = {
            name: minifigId,
            no: 'unknown',
            error: error.message
          };
          console.log(`❌ Failed: ${minifigId} - ${error.message}`);
        }
      }
      
      // Track which sets contain this minifig
      if (!minifigToSets[minifigId]) {
        minifigToSets[minifigId] = [];
      }
      minifigToSets[minifigId].push({
        set: setNumber,
        set_name: setData.name,
        quantity: minifig.quantity
      });
    }
  }
  
  // Add cross-reference data
  for (const minifigId of Object.keys(minifigDatabase)) {
    minifigDatabase[minifigId].appears_in = minifigToSets[minifigId] || [];
    minifigDatabase[minifigId].total_quantity = minifigToSets[minifigId]?.reduce((sum, entry) => sum + entry.quantity, 0) || 0;
  }
  
  await fs.writeFile('minifig_database.json', JSON.stringify(minifigDatabase, null, 2));
  console.log(`\n🎉 Created minifig database with ${Object.keys(minifigDatabase).length} unique minifigs`);
}

createMinifigDatabase();