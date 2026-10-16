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

// Anime info route (Pass AniList numeric ID like ?id=1 for Cowboy Bebop or ?id=21 for One Piece)
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

module.exports = router;

