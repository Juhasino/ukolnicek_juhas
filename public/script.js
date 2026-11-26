
//Načtení si přes document.getElementById důležité prvky ze stránky index.html
const form = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const priorityInput = document.getElementById('priority');
const list = document.getElementById('task-list');
const errorBox = document.getElementById('error');

// Třídy pro barvy priorit (bez diakritiky, aby se daly použít v CSS)
const priorityClass = { 'nízká': 'nizka', 'střední': 'stredni', 'vysoká': 'vysoka' };

// Načte úkoly ze serveru a vypíše je do seznamu
async function loadTasks() {  //stažení dat ze serveru a vykreslení seznamu
  try {
    const response = await fetch('/api/tasks');  // Pošle GET požadavek na server a převede odpověď na pole úkolů
    if (!response.ok) {
      throw new Error('Server vrátil chybu ' + response.status);
    }
    const tasks = await response.json();

    list.innerHTML = ''; // Vymaže starý seznam, aby se úkoly nevykreslily dvakrát
    for (const task of tasks) {  //// Pro každý úkol vytvoří nový řádek se zaškrtávátkem, textem, prioritou a tlačítkem Smazat
      const li = document.createElement('li');
      if (task.done) {
        li.className = 'done'; // splněný úkol bude přeškrtnutý
      }

      // Zaškrtávací políčko - mění stav splnění
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; // Nastaví ho jako zaškrtávací políčko (checkbox)
      checkbox.checked = task.done; // Zaškrtne ho nebo odškrtne podle toho, zda je úkol splněný
      checkbox.addEventListener('change', () => {  // Při kliknutí na zaškrtávátko změní stav splnění na serveru
        toggleTask(task._id, checkbox.checked);
      });

      // Vytvoří prvek <span> pro text samotného úkolu
      const text = document.createElement('span');
      text.className = 'text'; // Dá mu třídu "text" (kvůli vzhledu v CSS)
      text.textContent = task.title;
      
      // Vytvoří prvek <span> pro štítek priority
      const priority = document.createElement('span');
      priority.className = 'priority ' + priorityClass[task.priority]; // Dá mu třídu "priority" a k tomu třídu podle priority (např. "vysoka")
      priority.textContent = task.priority; // Vypíše dovnitř text priority (např. "vysoká")

      // Vytvoří tlačítko pro smazání úkolu
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete'; 
      deleteButton.textContent = 'Smazat';// Nastaví nápis na tlačítku na "Smazat"
      deleteButton.addEventListener('click', () => {    // Při kliknutí smaže konkrétní úkol podle jeho ID
        deleteTask(task._id);
      });

      // Vloží konkrétní věci dovnitř řádku <li>
      li.appendChild(checkbox); 
      li.appendChild(text);
      li.appendChild(priority);
      li.appendChild(deleteButton);
      list.appendChild(li); // Vloží celý hotový řádek <li> do seznamu <ul> na stránce
    }
    errorBox.textContent = '';  // Vyčistí případnou předchozí chybu
  } catch (error) {
    errorBox.textContent = 'Nepodařilo se načíst úkoly: ' + error.message;  // Kdyby se načítání nepovedlo, vypíše chybu do stránky
  }
}

// Odeslání formuláře - pošle nový úkol na server (bez znovunačtení stránky)
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // zabrání obnovení stránky

  try {
    const response = await fetch('/api/tasks', { // Pošle data úkolu na server jako JSON (metoda POST)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleInput.value,
        priority: priorityInput.value // Převedení objektu s názvem a prioritou úkolu na JSON text a pošle ho v těle požadavku
      })
    });

    const data = await response.json();// Přečte odpověď serveru jako JSON
    if (!response.ok) {
      throw new Error(data.error || 'Neznámá chyba');
    }

    titleInput.value = '';  // Vyčistí textové pole a znovu načte seznam, aby se nový úkol hned ukázal
    await loadTasks(); // aktualizuje seznam
  } catch (error) {
    errorBox.textContent = 'Chyba: ' + error.message;
  }
});

// Pošle serveru nový stav splnění (true/false) a překreslí seznam
async function toggleTask(id, done) {
  try {
    const response = await fetch('/api/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }, // Říká serveru, že posíláme JSON
      body: JSON.stringify({ done: done })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Neznámá chyba');
    }
    await loadTasks(); // Znovu načte seznam, aby se úkol přeškrtl nebo odškrtl bez reloadu stránky
  } catch (error) {
    errorBox.textContent = 'Chyba: ' + error.message;
  }
}

// Smazání úkolu (DELETE)  
async function deleteTask(id) {  // Pošle serveru požadavek na smazání úkolu podle ID a překreslí seznam
  try {
    const response = await fetch('/api/tasks/' + id, { method: 'DELETE' });  // Pošle DELETE požadavek na adresu /api/tasks/ + ID úkolu ke smazání

    const data = await response.json();  // Přečte odpověď serveru jako JSON
    if (!response.ok) {
      throw new Error(data.error || 'Neznámá chyba');
    }
    await loadTasks();
  } catch (error) {
    errorBox.textContent = 'Chyba: ' + error.message;
  }
}

// Při otevření stránky se hned načtou uložené úkoly
loadTasks();
