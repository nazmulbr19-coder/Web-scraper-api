const express = require('express');
const router = express.Router();
const { searchGogoanime, getAnimeDetails, getEpisodeSources } = require('../extractors/gogoanime');

// Search route
router.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  const results = await searchGogoanime(query);
  res.json({ results });
});

// Anime info & episodes route
router.get('/info', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Anime ID parameter is required' });
  }
  const details = await getAnimeDetails(id);
  if (!details) {
    return res.status(404).json({ error: 'Anime not found' });
  }
  res.json(details);
});

// Episode watch/stream sources route
router.get('/watch', async (req, res) => {
  const episodeId = req.query.episodeId;
  if (!episodeId) {
    return res.status(400).json({ error: 'Episode ID parameter is required' });
  }
  const sources = await getEpisodeSources(episodeId);
  res.json(sources);
});

module.exports = router;
