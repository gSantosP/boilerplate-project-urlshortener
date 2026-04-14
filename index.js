const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Configurações básicas
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Armazenamento em memória (User Story #2 e #3)
let urlDatabase = {};
let counter = 1;

// Endpoint POST para encurtar URL (User Story #2 e #4)
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  // 1. Validar o formato da URL (User Story #4)
  // O teste do FCC exige que a URL comece com http:// ou https://
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Validar se o domínio existe usando dns.lookup
  const hostname = urlParser.parse(originalUrl).hostname;
  
  dns.lookup(hostname, (err) => {
    if (err) {
      // Nota: Alguns ambientes de teste do FCC aceitam a falha no regex, 
      // mas o dns.lookup é a recomendação oficial do desafio.
      return res.json({ error: 'invalid url' });
    } else {
      // 3. Salvar e retornar JSON (User Story #2)
      const shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;
      
      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
});

// Endpoint GET para redirecionamento (User Story #3)
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});