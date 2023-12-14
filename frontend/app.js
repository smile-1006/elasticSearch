const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 5601;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
});

app.post('/pipe', async (req, res) => {
  try {
    const data = req.body.data;
    const url = `http://127.0.0.1:4000/autocomplete?query=${encodeURIComponent(data)}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
