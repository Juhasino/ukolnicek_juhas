// 1) Načtení knihoven 
const express = require('express');
const mongoose = require('mongoose');

const app = express(); // Vytvoření aplikace

// Port a adresa kde běží databáze (lze změnit proměnnými prostředí, jinak se použijí výchozí hodnoty)
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ukolnicek';

//  2) Middleware 
app.use(express.json());          // umí číst JSON z těla požadavku, když Když mi někdo pošle data ve formátu JSON (třeba z formuláře na webu), tak at se převedou na normální JavaScript objekt, ať s nimi umím pracovat v req.body
app.use(express.static('public')); // servíruje frontend ze složky public

//  3) Model úkolu (tak bude vypadat záznam v databázi) 
const Task = mongoose.model('Task', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['nízká', 'střední', 'vysoká'], default: 'střední' },
  done: { type: Boolean, default: false }, // splněno / nesplněno
  createdAt: { type: Date, default: Date.now } // Datum a čas vytvoření se nastaví samo pomocí Date.now
}));

//  4) API endpointy 



// GET /api/tasks - vrátí všechny úkoly z databáze jako JSON
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // najde v databázi všechny úkoly a seřadí je od nejnovějších
    res.json(tasks); //pošle je prohlížeči jako JSON.
  } catch (err) {
    res.status(500).json({ error: 'Chyba při načítání úkolů.' });
  }
});

// POST /api/tasks - ověří data a uloží nový úkol
app.post('/api/tasks', async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''; //Jestli to je text a pokud ano, tak to jenom ořízne
    const priority = req.body.priority; //uloží vybraná priorita

    // Validace: název nesmí být prázdný
    if (!title) {
      return res.status(400).json({ error: 'Název úkolu nesmí být prázdný.' });
    }
    // Validace: priorita musí být jedna z povolených
    if (!['nízká', 'střední', 'vysoká'].includes(priority)) {
      return res.status(400).json({ error: 'Neplatná priorita.' });
    }

    const task = await Task.create({ title, priority }); //Uloží nový úkol do databáze
    res.status(201).json(task); // Vrátí stav 201 (Created – vytvořeno) a uložený úkol včetně jeho vygenerovaného _id
  } catch (err) {
    res.status(500).json({ error: 'Chyba při ukládání úkolu.' });
  }
});



// PATCH /api/tasks/:id - změní stav splnění úkolu (done: true / false)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    // Validace: ID musí mít správný formát a done musí být true/false
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Neplatné ID úkolu.' });
    }
    if (typeof req.body.done !== 'boolean') {
      return res.status(400).json({ error: 'Hodnota done musí být true nebo false.' });
    }

    const task = await Task.findByIdAndUpdate( //Najde úkol podle ID
      req.params.id,
      { done: req.body.done },
      { new: true } // vrátí už upravený záznam
    );
    if (!task) {
      return res.status(404).json({ error: 'Úkol nebyl nalezen.' });
    }
    res.json(task); //Pošle upravený úkol zpět jako JSON
  } catch (err) {
    res.status(500).json({ error: 'Chyba při úpravě úkolu.' });
  }
});

// DELETE /api/tasks/:id - smaže úkol z databáze
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Neplatné ID úkolu.' });
    }

    const task = await Task.findByIdAndDelete(req.params.id); //Najde úkol podle ID a smaže ho z databáze
    if (!task) {
      return res.status(404).json({ error: 'Úkol nebyl nalezen.' });
    }
    res.json({ message: 'Úkol byl smazán.' });
  } catch (err) {
    res.status(500).json({ error: 'Chyba při mazání úkolu.' });
  }
});

// Připojení k databázi a spuštění serveru
mongoose.connect(MONGODB_URI) //Připojení k té databázi
  .then(() => {  //Když se to podaří tak se vypíše hláška pod tím
    console.log('Připojeno k MongoDB.');
    app.listen(PORT, () => { //a zavolá app.listen(PORT, ...), což teprve zapne samotný webový server na portu 3000
      console.log('Server běží na http://localhost:' + PORT);
    });
  })
  .catch((err) => {    //znamená když se připojení nepovede, vypíše chybovou hlášku do konzole
    console.error('Nepodařilo se připojit k MongoDB:', err.message);
  });
