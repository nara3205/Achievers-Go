const express = require('express');
const cors = require('cors');
const connection = require('../trash/db');
const app = express();
const port = 8000;
app.use(cors()); 

// permet que Node llegeixi JSON automàticament
app.use(express.json());

// Ruta de prova
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hola juju!' });
});

app.get('/api/db', (req, res) => {
  connection.query('SELECT * FROM lights', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Backend corrent a http://localhost:${port}`);
});

