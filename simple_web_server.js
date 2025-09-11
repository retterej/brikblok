import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;
const DB_FILE = path.join(__dirname, 'simple_sets.json');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function loadSets() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSets(sets) {
  await fs.writeFile(DB_FILE, JSON.stringify(sets, null, 2));
}

app.get('/', async (req, res) => {
  const sets = await loadSets();
  res.render('simple', { sets, error: null, success: null });
});

app.post('/add', async (req, res) => {
  try {
    const { setNumber } = req.body;
    if (!setNumber) {
      throw new Error('Set number required');
    }

    const sets = await loadSets();
    if (!sets.includes(setNumber)) {
      sets.push(setNumber);
      await saveSets(sets);
      res.render('simple', { sets, error: null, success: `Added: ${setNumber}` });
    } else {
      res.render('simple', { sets, error: `Already tracking: ${setNumber}`, success: null });
    }
  } catch (error) {
    const sets = await loadSets();
    res.render('simple', { sets, error: error.message, success: null });
  }
});

app.delete('/set/:setNumber', async (req, res) => {
  try {
    const sets = await loadSets();
    const filtered = sets.filter(s => s !== req.params.setNumber);
    await saveSets(filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Simple LEGO tracker running on http://localhost:${PORT}`);
});