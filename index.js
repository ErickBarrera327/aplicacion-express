const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();

/* ===============================
   MIDDLEWARES
================================ */

// JSON parser (Express nativo)
app.use(express.json());

// CORS (necesario para Expo)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Logger para depuración
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/* ===============================
   BASE DE DATOS SQLITE
================================ */

const dbPath = path.join(__dirname, 'base.sqlite3');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* ===============================
   ENDPOINTS
================================ */

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// INSERTAR TAREA / CORREO
app.post('/insert', (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    return res.status(400).json({ error: 'El campo "todo" es obligatorio' });
  }

  db.run(
    'INSERT INTO todos (todo) VALUES (?)',
    [todo],
    function (err) {
      if (err) {
        console.error('Error al insertar:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        todo
      });
    }
  );
});

// LISTAR TODAS LAS TAREAS
app.get('/leer_todos', (req, res) => {
  db.all(
    'SELECT id, todo, created_at FROM todos ORDER BY id DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Error al consultar:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json(rows);
    }
  );
});

/* ===============================
   SERVIDOR (RENDER)
================================ */

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
}

// Exportación opcional (tests)
module.exports = { app, db };
