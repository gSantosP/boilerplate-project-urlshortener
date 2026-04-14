const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// 1. Armazenamento: Use um Map ou Objeto global
const urlDatabase = {};
let counter = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// 2. Rota POST (Correção do Teste #2)
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validação estrita de formato (Exigência do FCC)
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extrair apenas o hostname para o dns.lookup
  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // CRITICAL: O short_url deve ser um NUMBER
    const shortUrl = counter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl // Enviado como número
    });
  });
});

// 3. Rota GET (Correção do Teste #3)
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // Como params vêm como string, buscamos no objeto usando a string
  // O JavaScript tratará a chave numérica do objeto corretamente
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Node.js listening ...');
});