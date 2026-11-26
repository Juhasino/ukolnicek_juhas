# Úkolníček

Jednoduchá webová aplikace s architekturou **Klient – Server – Databáze**.

- **Frontend:** HTML, CSS, JavaScript (`fetch`, `async/await`, `try/catch`)
- **Backend:** Node.js + Express
- **Databáze:** MongoDB (přes Mongoose)

Uživatel zadá úkol a prioritu, úkol se uloží do databáze a seznam se aktualizuje bez obnovení stránky. Úkol lze označit jako splněný nebo smazat. Data zůstanou uložená i po restartu serveru.

## Požadavky
- Node.js (https://nodejs.org)
- MongoDB Community Server (https://www.mongodb.com/try/download/community) nebo účet na MongoDB Atlas

## Spuštění
1. Stáhněte závislosti: `npm install`
2. Ujistěte se, že běží MongoDB.
3. Spusťte aplikaci: `npm start`
4. Otevřete http://localhost:3000

## Proměnné prostředí (nepovinné)
| Proměnná | Výchozí hodnota | Popis |
|---|---|---|
| `PORT` | `3000` | port serveru |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ukolnicek` | adresa databáze |

Příklad pro Windows (PowerShell): `$env:MONGODB_URI="mongodb+srv://..."; npm start`
Příklad pro macOS/Linux: `MONGODB_URI="mongodb+srv://..." npm start`

## API
- `GET /api/tasks` – vrátí všechny úkoly (JSON)
- `POST /api/tasks` – uloží nový úkol `{ "title": "...", "priority": "střední" }`; prázdný název vrátí chybu 400
- `PATCH /api/tasks/:id` – změní stav splnění `{ "done": true }`
- `DELETE /api/tasks/:id` – smaže úkol
