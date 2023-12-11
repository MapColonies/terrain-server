const express = require('express');
const sqlite3 = require('better-sqlite3');
const { createPool } = require('generic-pool');
const cors = require('cors');

const PORT = process.env.PORT || 8000;
const TERRAIN_TILES_TABLE = 'terrain_tiles';
const LAYER_JSON_TABLE = 'layer_json';
const PATH = '/home/ellama/Downloads/data/';
const SUFFIX = '.gpkg';

const app = express();

app.use(cors());

// Create a factory object for creating SQLite connections
const factory = {
  create: function() {
    return new sqlite3(`${PATH}meimad${SUFFIX}`, { readonly: true });
  },
  destroy: function(db) {
    db.close();
  }
};

// Create a pool using generic-pool
const pool = createPool({
  create: factory.create,
  destroy: factory.destroy
}, {
  max: 10, // maximum number of connections to create at any given time (default: 1)
  min: 2 // minimum number of connections to keep in pool at any given time (default: 0)
});

app.get('/terrains/:gpkg/:z/:x/:y.terrain', async (request, response) => {
  const { gpkg, z, x, y } = request.params;
  let connection;
  try {
    const query = `SELECT tile_data FROM ${TERRAIN_TILES_TABLE} WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?`;

    // Acquire a connection from the pool
    const connection = await pool.acquire();
    const stmt = connection.prepare(query);
    const result = stmt.get(z, x, y);

    response.header('Content-Encoding', 'gzip');
    response.type('application/octet-stream');
    response.send(result.tile_data);
  } catch (err) {
    if (connection) {
      // If an error occurs, ensure the connection is released back to the pool
      await pool.release(connection);
    }
    response.status(500).json({ error: err.message });
  }
});

app.get('/terrains/:gpkg/layer.json', async (request, response) => {
  const { gpkg } = request.params;
  let connection;
  try {
    const query = `SELECT data FROM ${LAYER_JSON_TABLE}`;

    // Acquire a connection from the pool
    connection = await pool.acquire();
    const stmt = connection.prepare(query);
    const result = stmt.get();

    response.json(JSON.parse(result.data));
  } catch (err) {
    if (connection) {
      // If an error occurs, ensure the connection is released back to the pool
      await pool.release(connection);
    }
    response.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});