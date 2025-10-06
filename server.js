const http = require('http');
const fs = require('fs');
const port = 3000;

const counterFile = 'counter.txt';
const guestsFile = 'guests.txt';

let counter = 0;
if (fs.existsSync(counterFile)) {
  try {
    counter = parseInt(fs.readFileSync(counterFile, 'utf8')) || 0;
  } catch {
    counter = 0;
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/') {
    counter++;
    fs.writeFileSync(counterFile, counter.toString());
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`Witaj na stronie! Odwiedziłeś ją już ${counter} razy.`);
  } else if (url.pathname === '/add') {
    const name = url.searchParams.get('name');
    if (!name) {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('Błąd: brak parametru name.');
      return;
    }
    fs.appendFile(guestsFile, name + '\n', (err) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Błąd zapisu.');
      } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`Dodano ${name} do listy gości.`);
      }
    });
  } else if (url.pathname === '/list') {
    fs.readFile(guestsFile, 'utf8', (err, data) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      if (err || !data) {
        res.end('Lista gości jest pusta.');
      } else {
        res.end('Lista gości:\n' + data);
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 - Strona nie istnieje');
  }
});

server.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
