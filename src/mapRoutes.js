// GET /api/maps/country/:code.svg  ->  the themed globe for a country.
// Public and DB-free (it is only a picture). Maps never change, so they are cached
// in memory (see geoMap.js), sent gzipped, and cached hard by the browser.
const express = require('express');
const { getGlobe } = require('./game/geoMap');

const router = express.Router();

router.get('/country/:code.svg', async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return res.status(400).end();
  try {
    const globe = await getGlobe(code);
    if (!globe) return res.status(404).end();
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=604800, immutable');
    res.set('Vary', 'Accept-Encoding');
    if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      res.set('Content-Encoding', 'gzip');
      return res.send(globe.gz);
    }
    res.send(globe.svg);
  } catch (err) {
    console.error('map render failed:', err);
    res.status(500).end();
  }
});

module.exports = router;
