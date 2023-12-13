const express = require('express');
const { Pool } = require('better-sqlite-pool');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8000;
const TERRAIN_TILES_TABLE = 'terrain_tiles';
const LAYER_JSON_TABLE = 'layer_json';
const GPKG_PATH = '/data';
const SUFFIX = '.gpkg';
const terrains = new Map();

const app = express();

app.use(cors());

fs.readdirSync(GPKG_PATH).forEach(file => {
  if (file.endsWith(SUFFIX)) {
    const pool = new Pool(path.join(GPKG_PATH, file));
    terrains.set(path.parse(file).name, pool);
  }
});

app.get('/terrains/:gpkg/:z/:x/:y.terrain', async (request, response) => {
  const { gpkg, z, x, y } = request.params;
  const pool = terrains.get(gpkg);
  const db = await pool.acquire();
  const result = db.prepare(`SELECT tile_data FROM ${TERRAIN_TILES_TABLE} WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?`).get(z, x, y);
  response.header('Content-Encoding', 'gzip');
  response.type('application/octet-stream');
  response.send(result.tile_data);
  db.release();
});

app.get('/terrains/:gpkg/layer.json', async (request, response) => {
  const { gpkg } = request.params;
  const pool = terrains.get(gpkg);
  const db = await pool.acquire();
  const result = db.prepare(`SELECT data FROM ${LAYER_JSON_TABLE}`).get();
  response.json(JSON.parse(result.data));
  db.release();
});

app.get('/health', async (request, response) => {
  response.status(200).send();
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
