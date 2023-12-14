const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Elasticsearch client
const client = new Client({ node: 'http://localhost:5601' });
const indexName = 'aicte';

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Controller class
class Controller {
  constructor(query) {
    this.query = query;
    this.baseQuery = {
      _source: [],
      size: 0,
      min_score: 0.5,
      query: {
        bool: {
          must: [
            {
              match_phrase_prefix: {
                title: {
                  query: this.query,
                },
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
      aggs: {
        auto_complete: {
          terms: {
            field: 'title.keyword',
            order: {
              _count: 'desc',
            },
            size: 25,
          },
        },
      },
    };
  }

  async get() {
    const { body } = await client.search({
      index: indexName,
      size: 0,
      body: this.baseQuery,
    });
    return body;
  }
}

// Express route
app.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const controller = new Controller(query);
    const result = await controller.get();
    res.json(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('home');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
