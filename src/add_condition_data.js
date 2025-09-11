import fs from 'fs/promises';

async function addConditionData() {
  const originalXml = await fs.readFile('data/sets.xml', 'utf8');
  const sets = JSON.parse(await fs.readFile('lego_sets.json', 'utf8'));
  
  // Extract sets marked as New (N) from original XML
  const newSets = new Set();
  const itemMatches = originalXml.match(/<ITEM>.*?<\/ITEM>/g) || [];
  
  for (const item of itemMatches) {
    const idMatch = item.match(/<ITEMID>([^<]+)<\/ITEMID>/);
    const conditionMatch = item.match(/<CONDITION>([^<]+)<\/CONDITION>/);
    
    if (idMatch && conditionMatch && conditionMatch[1] === 'N') {
      newSets.add(idMatch[1]);
    }
  }
  
  // Add condition to sets
  for (const setNumber of Object.keys(sets)) {
    sets[setNumber].condition = newSets.has(setNumber) ? 'new' : 'used';
  }
  
  await fs.writeFile('lego_sets.json', JSON.stringify(sets, null, 2));
  console.log(`✅ Added condition data to all sets (${newSets.size} new, ${Object.keys(sets).length - newSets.size} used)`);
}

addConditionData();