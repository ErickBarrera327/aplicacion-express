const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/* ===============================
   BASE DE DATOS
================================ */
const db = new sqlite3.Database('./base.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/* ===============================
   ENDPOINTS
================================ */

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// INSERTAR
app.post('/insert', (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    return res.status(400).json({ error: 'El campo todo es obligatorio' });
  }

  db.run(
    'INSERT INTO todos (todo) VALUES (?)',
    [todo],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        todo
      });
    }
  );
});

// 🔑 LISTAR (ESTE ERA EL FALTANTE)
app.get('/leer_todos', (req, res) => {
  db.all(
    'SELECT id, todo, created_at FROM todos ORDER BY id DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json(rows);
    }
  );
});

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Aplicación corriendo en http://localhost:${PORT}`);
});
