// GET /api/maps/country/:code.svg  ->  the themed globe for a country.
// Public and DB-free (it is only a picture); cached hard because the maps never change.
const express = require('express');
const { countryGlobeSvg } = require('./game/geoMap');

const router = express.Router();

router.get('/country/:code.svg', async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return res.status(400).end();
  try {
    const svg = await countryGlobeSvg(code);
    if (!svg) return res.status(404).end();
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=604800, immutable');
    res.send(svg);
  } catch (err) {
    console.error('map render failed:', err);
    res.status(500).end();
  }
});

module.exports = router;
