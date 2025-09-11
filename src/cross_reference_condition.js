import fs from 'fs/promises';

async function crossReferenceCondition() {
  // Read original XML to get condition data
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
  
  console.log(`Found ${newSets.size} sets marked as New in original XML`);
  
  // Generate new XML with correct conditions
  let xml = '<INVENTORY>';
  
  for (const setNumber of Object.keys(sets)) {
    const condition = newSets.has(setNumber) ? 'N' : 'U';
    xml += `<ITEM><ITEMTYPE>S</ITEMTYPE><ITEMID>${setNumber}</ITEMID><COLOR>0</COLOR><QTY>1</QTY><CONDITION>${condition}</CONDITION><SUBCONDITION>C</SUBCONDITION></ITEM>`;
  }
  
  xml += '</INVENTORY>';
  
  await fs.writeFile('complete_inventory_with_conditions.xml', xml);
  console.log(`✅ Exported ${Object.keys(sets).length} sets with correct conditions`);
  console.log(`New sets: ${Array.from(newSets).join(', ')}`);
}

crossReferenceCondition();