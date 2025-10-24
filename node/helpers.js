const style = `<style>
body { font-family: Arial; padding: 2em; background: #fcfcdb; }
h1 { color: #404080; }
ul { background: #fff7; padding: 1em; border-radius: 8px; }
label { margin-right: 6px; }
input[type=text] { padding: 4px; }
button { padding: 4px 12px; }
</style>`;

function validateName(name) {
  if (!name) return false;
  if (name.length === 0 || name.length > 50) return false;
  if (/[^\wąćęłńóśźż -]/.test(name)) return false;
  return true;
}

function renderGuests(guests) {
  if (!guests.length) return '<p>Lista gości jest pusta.</p>';
  return `<ul>${guests.map(g => `<li>${g.name} (${g.date}, ${g.ip || 'brak IP'}) 
    <form method="POST" action="/delete" style="display:inline">
      <input type="hidden" name="name" value="${g.name}">
      <button type="submit">Usuń</button>
    </form></li>`).join('\n')}</ul>`;
}

function errorHTML(title, msg) {
  return `<!DOCTYPE html><html><head>${style}</head>
    <body><h1>${title}</h1><p>${msg}</p><a href="/">Powrót</a></body></html>`;
}

module.exports = {
  style,
  validateName,
  renderGuests,
  errorHTML,
};
