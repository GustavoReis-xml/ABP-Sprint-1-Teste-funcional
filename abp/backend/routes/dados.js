const express = require('express');
const router = express.Router();
const pool = require('../db');

// FOCOS POR ESTADO
router.get('/focos-estado', async (req, res) => {
  const { estado } = req.query;
  console.log('Recebendo requisição para /focos-estado');
  console.log('Parametros recebidos - Estado:', estado);

  try {
    const result = await pool.query(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(ST_AsGeoJSON(fc.*)::jsonb)
      ) FROM fococalor fc WHERE fc.estado_id = $1`, [estado]
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (error) {
    console.error('Erro ao carregar os dados:', error);
    res.status(500).send('Erro no servidor');
  }
});

// FOCOS POR BIOMA (filtro por bioma)
router.get('/focos-bioma', async (req, res) => {
  const { bioma } = req.query;
  console.log('Recebendo requisição para /focos-bioma');
  console.log('Parametros recebidos - Bioma:', bioma);

  try {
    const result = await pool.query(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(ST_AsGeoJSON(fc.*)::jsonb)
      ) FROM fococalor fc WHERE fc.id_bioma = $1`, [bioma]
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (error) {
    console.error('Erro ao carregar os dados:', error);
    res.status(500).send('Erro no servidor');
  }
});

// ÁREA QUEIMADA POR ESTADO (filtro por UF)
router.get('/area-estado', async (req, res) => {
  const { estado } = req.query;
  console.log('Recebendo requisição para /area-estado');
  console.log('Parametros recebidos - Estado:', estado);

  try {
    const result = await pool.query(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
      ) FROM area_queimada a
      JOIN estados e ON ST_Intersects(a.geom, e.geom)
      WHERE e.cd_uf = $1`, [estado]
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (error) {
    console.error('Erro ao carregar os dados:', error);
    res.status(500).send('Erro no servidor');
  }
});

// ÁREA QUEIMADA POR BIOMA (filtro por bioma)
router.get('/area-bioma', async (req, res) => {
  const { bioma } = req.query;
  console.log('Recebendo requisição para /area-bioma');
  console.log('Parametros recebidos - Bioma:', bioma);

  try {
    const result = await pool.query(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(ST_AsGeoJSON(a.*)::jsonb)
      ) FROM area_queimada a
      JOIN biomas b ON ST_Intersects(a.geom, b.geom)
      WHERE b.gid = $1`, [bioma]
    );
    res.json(result.rows[0].jsonb_build_object);
  } catch (error) {
    console.error('Erro ao carregar os dados:', error);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
