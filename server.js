const http = require('http');
const fs = require('fs');
const port = 3000;
const counterFile = 'counter.json';
const guestsFile = 'guests.json';
const ipStatsFile = 'ipstats.json';
const logFile = 'access.log';

let counter = 0;
let ipStats = {};

if (fs.existsSync(counterFile)) {
  try { counter = JSON.parse(fs.readFileSync(counterFile, 'utf8')).all || 0; } catch { counter = 0; }
}
if (fs.existsSync(ipStatsFile)) {
  try { ipStats = JSON.parse(fs.readFileSync(ipStatsFile, 'utf8')) || {}; } catch { ipStats = {}; }
}

const style = `<style>
body { font-family: Arial; padding: 2em; background: #fcfcdb; }
h1 { color: #404080; }
ul { background: #fff7; padding: 1em; border-radius: 8px; }
label { margin-right: 6px; }
input[type=text] { padding: 4px; }
button { padding: 4px 12px; }
</style>`;

function logAccess(ip, path, code) {
  const line = `[${new Date().toISOString()}] ${ip} ${path} ${code}\n`;
  fs.appendFile(logFile, line, () => {});
}

function saveStats() {
  fs.writeFileSync(counterFile, JSON.stringify({all: counter}));
  fs.writeFileSync(ipStatsFile, JSON.stringify(ipStats));
}

function renderGuests(guests) {
  if (!guests.length) return '<p>Lista gości jest pusta.</p>';
  return `<ul>${guests.map(g => `<li>${g.name} (${g.date}, ${g.ip || 'brak IP'}) 
    <form method="POST" action="/delete" style="display:inline">
      <input type="hidden" name="name" value="${g.name}">
      <button type="submit">Usuń</button>
    </form></li>`).join('\n')}</ul>`;
}

function parseJSONFile(file) {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

function saveGuests(guests) {
  fs.writeFileSync(guestsFile, JSON.stringify(guests, null, 2));
}

function validateName(name) {
  if (!name) return false;
  if (name.length === 0 || name.length > 50) return false;
  if (/[^\wąćęłńóśźż -]/.test(name)) return false;
  return true;
}

function errorHTML(title, msg, code = 500) {
  return `<!DOCTYPE html><html><head>${style}</head>
      <body><h1>${title}</h1><p>${msg}</p><a href="/">Powrót</a></body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let statusCode = 200;

  if (req.method === 'GET' && url.pathname === '/') {
    counter++;
    saveStats();
    ipStats[ip] = (ipStats[ip] || 0) + 1;
    saveStats();
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html><html><head>${style}</head>
      <body>
      <h1>Witaj na stronie!</h1>
      <p>Odwiedziłeś ją już <b>${counter}</b> razy.</p>
      <a href="/list">Lista gości</a>
      <a href="/stats" style="margin-left: 10px">Statystyki IP</a>
      <a href="/form" style="margin-left: 10px">Dodaj gościa (formularz)</a>
      </body></html>`);
    logAccess(ip, url.pathname, 200);
  }
  else if (req.method === 'GET' && url.pathname === '/add') {
    const name = url.searchParams.get('name');
    if (!validateName(name)) {
      statusCode = 400;
      res.writeHead(400, {'Content-Type': 'text/html; charset=UTF-8'});
      res.end(errorHTML('Błąd', 'Nieprawidłowe imię'));
      logAccess(ip, url.pathname, 400);
      return;
    }
    try {
      const guests = parseJSONFile(guestsFile);
      const now = new Date().toLocaleString();
      guests.push({name, date: now, ip});
      saveGuests(guests);
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`<!DOCTYPE html><html><head>${style}</head><body>
        <p>Dodano: ${name} (${now})</p><a href="/list">Powrót do listy</a></body></html>`);
      logAccess(ip, url.pathname, 200);
    } catch (e) {
      statusCode = 500;
      res.writeHead(500, {'Content-Type': 'text/html; charset=UTF-8'});
      res.end(errorHTML('Błąd serwera', 'Nie można zapisać danych'));
      logAccess(ip, url.pathname, 500);
    }
  }
  else if (req.method === 'GET' && url.pathname === '/list') {
    try {
      const guests = parseJSONFile(guestsFile);
      if (!guests.length) {
        statusCode = 204;
        res.writeHead(204, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(errorHTML('Brak gości', 'Lista gości jest pusta.'));
        logAccess(ip, url.pathname, 204);
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`<!DOCTYPE html><html><head>${style}</head>
        <body><h1>Lista gości</h1>${renderGuests(guests)}
        <a href="/">Powrót</a></body></html>`);
      logAccess(ip, url.pathname, 200);
    } catch (e) {
      statusCode = 500;
      res.writeHead(500, {'Content-Type': 'text/html; charset=UTF-8'});
      res.end(errorHTML('Błąd serwera', 'Nie można odczytać pliku.'));
      logAccess(ip, url.pathname, 500);
    }
  }
  else if (req.method === 'GET' && url.pathname === '/stats') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html><html><head>${style}</head>
      <body><h1>Statystyki adresów IP</h1>
      <ul>${
        Object.entries(ipStats)
        .map(([ip, n]) => `<li>${ip}: ${n} odwiedzin</li>`).join('')
      }</ul><a href="/">Powrót</a></body></html>`);
    logAccess(ip, url.pathname, 200);
  }
  else if (req.method === 'GET' && url.pathname === '/clear') {
    try {
      saveGuests([]);
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`<!DOCTYPE html><html><head>${style}</head>
        <body><h1>Wyczyszczono listę gości.</h1><a href="/list">Powrót do listy</a></body></html>`);
      logAccess(ip, url.pathname, 200);
    } catch (e) {
      statusCode = 500;
      res.writeHead(500, {'Content-Type': 'text/html; charset=UTF-8'});
      res.end(errorHTML('Błąd serwera', 'Nie udało się wyczyścić listy.'));
      logAccess(ip, url.pathname, 500);
    }
  }
  else if (req.method === 'POST' && url.pathname === '/delete') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const name = decodeURIComponent(body.split('=')[1]);
      if (!validateName(name)) {
        statusCode = 400;
        res.writeHead(400, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(errorHTML('Błąd', 'Nieprawidłowe imię.'));
        logAccess(ip, url.pathname, 400);
        return;
      }
      try {
        let guests = parseJSONFile(guestsFile);
        guests = guests.filter(g => g.name !== name);
        saveGuests(guests);
        res.writeHead(302, { Location: '/list' });
        res.end();
        logAccess(ip, url.pathname, 302);
      } catch (e) {
        statusCode = 500;
        res.writeHead(500, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(errorHTML('Błąd serwera', 'Nie udało się usunąć gościa.'));
        logAccess(ip, url.pathname, 500);
      }
    });
  }
  else if (req.method === 'GET' && url.pathname === '/form') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html><html><head>${style}</head><body>
      <h1>Dodaj gościa</h1>
      <form action="/form" method="POST">
        <label>Imię: <input name="name" type="text" required maxlength="50"></label>
        <button type="submit">Dodaj</button>
      </form>
      <a href="/">Powrót</a>
    </body></html>`);
    logAccess(ip, url.pathname, 200);
  }
  else if (req.method === 'POST' && url.pathname === '/form') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const name = decodeURIComponent(body.split('=')[1]);
      if (!validateName(name)) {
        statusCode = 400;
        res.writeHead(400, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(errorHTML('Błąd', 'Nieprawidłowe imię.'));
        logAccess(ip, url.pathname, 400);
        return;
      }
      try {
        const guests = parseJSONFile(guestsFile);
        const now = new Date().toLocaleString();
        guests.push({name, date: now, ip});
        saveGuests(guests);
        res.writeHead(302, { Location: '/list' });
        res.end();
        logAccess(ip, url.pathname, 302);
      } catch (e) {
        statusCode = 500;
        res.writeHead(500, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(errorHTML('Błąd serwera', 'Nie udało się zapisać.'));
        logAccess(ip, url.pathname, 500);
      }
    });
  }
  else {
    statusCode = 404;
    res.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'});
    res.end(errorHTML('404', 'Strona nie istnieje'));
    logAccess(ip, url.pathname, 404);
  }
});

process.on('uncaughtException', err => {
  fs.appendFile(logFile, `[${new Date().toISOString()}] SERVER CRASH ERROR: ${err}\n`, () => {});
});

process.on('unhandledRejection', (reason, promise) => {
  fs.appendFile(logFile, `[${new Date().toISOString()}] PROMISE REJECTION: ${reason}\n`, () => {});
});

server.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
