const express = require('express');
const router = express.Router();
const { searchAnime, getAnimeDetails } = require('../services/anilist');

// Search route
router.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  const results = await searchAnime(query);
  res.json({ results });
});

// Anime info & streaming episodes route
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

// Watch / Stream fallback route
router.get('/watch', async (req, res) => {
  res.status(410).json({ 
    error: 'Direct video scraping is unavailable on Vercel due to Cloudflare anti-bot protection.',
    message: 'Please use the streaming links provided in the /info endpoint under streamingEpisodes.' 
  });
});

module.exports = router;

