import fs from 'fs/promises';

async function exportToXml() {
  const data = await fs.readFile('lego_sets.json', 'utf8');
  const sets = JSON.parse(data);
  
  let xml = '<INVENTORY>';
  
  for (const setNumber of Object.keys(sets)) {
    xml += `<ITEM><ITEMTYPE>S</ITEMTYPE><ITEMID>${setNumber}</ITEMID><COLOR>0</COLOR><QTY>1</QTY><CONDITION>U</CONDITION><SUBCONDITION>C</SUBCONDITION></ITEM>`;
  }
  
  xml += '</INVENTORY>';
  
  await fs.writeFile('complete_inventory.xml', xml);
  console.log(`✅ Exported ${Object.keys(sets).length} sets to complete_inventory.xml`);
}

exportToXml();