const http = require('http');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1'; // localhost
const port = 3000;
const dbFilePath = 'Wochenplaner.db';
let db;

async function startServer() {
  db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });
  // Tabelle anlegen, falls nicht vorhanden
  await db.run(`CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      day TEXT,
      content TEXT,
      color TEXT
  )`);
  server.listen(port, hostname, () => { // Server starten
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

const server = http.createServer(async (request, response) => {
    response.statusCode = 200;
    response.setHeader('Access-Control-Allow-Origin', '*'); // bei CORS Fehler
    response.setHeader('Access-Control-Allow-Headers', '*'); // bei CORS Fehler

    let url = new URL(request.url || '', `http://${request.headers.host}`);
    switch (url.pathname) {
      case '/entry': {
        switch (request.method) {
          case 'GET':
            let result;
           
    
            result = await db.all('SELECT * FROM entries')
            
            response.setHeader('Content-Type', 'application/json');
            response.write(JSON.stringify(result));
            break;
          case 'POST':
            let jsonString = '';
            request.on('data', data => {
              jsonString += data;
            });
            request.on('end', async () => {
              const entry = JSON.parse(jsonString); 
              await db.run(
                'INSERT OR REPLACE INTO entries VALUES (?, ?, ?, ?, ?)',
                [entry.id, entry.type, entry.day, entry.content, entry.color]
              );
            });
            break;
        }
        break;
      }
     case '/clearAll':
       // await db.run('DELETE FROM entries');
        break;
      default:
        response.statusCode = 404;
    }
    response.end();
  }
);

startServer();