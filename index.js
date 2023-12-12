const express = require('express');
const sqlite3 = require('better-sqlite3');
const genericPool = require('generic-pool');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8000;
const TERRAIN_TILES_TABLE = 'terrain_tiles';
const LAYER_JSON_TABLE = 'layer_json';
const GPKG_PATH = '/home/ellama/Downloads/data/';
const SUFFIX = '.gpkg';
const terrains = new Map();
const OPTS = {
  max: 10, // maximum number of connections to create at any given time (default: 1)
  min: 2 // minimum number of connections to keep in pool at any given time (default: 0)
};

const app = express();

app.use(cors());

fs.readdirSync(GPKG_PATH).forEach(file => {
  if (file.endsWith(SUFFIX)) {
    // Create a factory object for creating SQLite connections
    const factory = {
      create: function() {
        return new sqlite3(`${GPKG_PATH}${file}`, { readonly: true });
      },
      destroy: function(db) {
        db.close();
      }
    };

    const pool = genericPool.createPool(factory, OPTS);

    // Add a pool for the current gpkg file to the map
    terrains.set(path.parse(file).name, pool);
  }
});

app.get('/terrains/:gpkg/:z/:x/:y.terrain', async (request, response) => {
  const { gpkg, z, x, y } = request.params;
  let gpkgPool;
  let connection;
  try {
    const query = `SELECT tile_data FROM ${TERRAIN_TILES_TABLE} WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?`;

    gpkgPool = terrains.get(gpkg);
    // Acquire a connection from the gpkg's pool
    connection = await gpkgPool.acquire();
    const stmt = connection.prepare(query);
    const result = stmt.get(z, x, y);

    response.header('Content-Encoding', 'gzip');
    response.type('application/octet-stream');
    response.send(result.tile_data);
  } catch (err) {
    if (connection) {
      // If an error occurs, ensure the connection is released back to the pool
      await gpkgPool.release(connection);
    }
    response.status(500).json({ error: err.message });
  }
});

app.get('/terrains/:gpkg/layer.json', async (request, response) => {
  const { gpkg } = request.params;
  let gpkgPool;
  let connection;
  try {
    const query = `SELECT data FROM ${LAYER_JSON_TABLE}`;

    gpkgPool = terrains.get(gpkg);
    // Acquire a connection from the gpkg's pool
    connection = await gpkgPool.acquire();
    const stmt = connection.prepare(query);
    const result = stmt.get();

    response.json(JSON.parse(result.data));
  } catch (err) {
    if (connection) {
      // If an error occurs, ensure the connection is released back to the pool
      await gpkgPool.release(connection);
    }
    response.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});