// server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// 📁 SQLite-DB vorbereiten
// ======================
const dbFile = "./data.db";
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      day TEXT,
      content TEXT,
      color TEXT
    )
  `);
});

// ======================
// ⚙️ Middleware
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ======================
// 📦 API-Routen
// ======================

// Alle Einträge laden
app.get("/api/entries", (req, res) => {
  db.all("SELECT * FROM entries", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Fehler beim Laden" });
    } else {
      res.json(rows);
    }
  });
});

// Eintrag speichern
app.post("/api/entries", (req, res) => {
  const { type, day, content, color } = req.body;
  const stmt = db.prepare("INSERT INTO entries (type, day, content, color) VALUES (?, ?, ?, ?)");
  stmt.run(type, day, content, color, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Fehler beim Speichern" });
    } else {
      res.json({ id: this.lastID });
    }
  });
  stmt.finalize();
});

// Eintrag löschen
app.delete("/api/entries/:id", (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare("DELETE FROM entries WHERE id = ?");
  stmt.run(id, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Fehler beim Löschen" });
    } else {
      res.json({ success: true });
    }
  });
  stmt.finalize();
});

// ======================
// 🌐 Server starten
// ======================
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});