import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { blRequest } from './src/bl_client.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'lego_sets.json');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get('/', async (req, res) => {
  const sets = await loadSets();
  const setList = Object.values(sets).sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
  res.render('index', { sets: setList, error: null, success: null });
});

app.post('/add', async (req, res) => {
  try {
    const { setNumber } = req.body;
    if (!setNumber) {
      throw new Error('Set number required');
    }

    const response = await blRequest("GET", `/items/SET/${setNumber}`);
    const setData = response.data;
    
    const sets = await loadSets();
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
    
    await saveSets(sets);
    const setList = Object.values(sets).sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
    res.render('index', { 
      sets: setList, 
      error: null, 
      success: `Added: ${setData.name} (${setNumber})` 
    });
  } catch (error) {
    const sets = await loadSets();
    const setList = Object.values(sets).sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
    res.render('index', { 
      sets: setList, 
      error: `Failed to add set: ${error.message}`, 
      success: null 
    });
  }
});

app.get('/minifigs', async (req, res) => {
  try {
    const minifigs = JSON.parse(await fs.readFile('minifig_database.json', 'utf8'));
    const sets = await loadSets();
    res.render('minifigs', { 
      minifigs, 
      totalSets: Object.keys(sets).length 
    });
  } catch (error) {
    res.status(500).send('Minifig database not found. Run: npm run minifig-db');
  }
});

app.delete('/set/:setNumber', async (req, res) => {
  try {
    const sets = await loadSets();
    delete sets[req.params.setNumber];
    await saveSets(sets);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`LEGO Sets web app running on http://localhost:${PORT}`);
});