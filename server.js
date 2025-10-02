const http = require('http');
const fs = require('fs');
const port = 3000;

const counterFile = 'counter.txt';

// Odczytaj licznik z pliku counter.txt lub ustaw na 0
let counter = 0;
if (fs.existsSync(counterFile)) {
  try {
    counter = parseInt(fs.readFileSync(counterFile, 'utf8')) || 0;
  } catch {
    counter = 0;
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    counter++;
    fs.writeFileSync(counterFile, counter.toString());
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`Witaj na stronie! Odwiedziłeś ją już ${counter} razy.`);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 - Strona nie istnieje');
  }
});

server.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
