
const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilist');
const gogoExtractor = require('../extractors/gogoanime');

router.get('/trending', async (req, res) => {
  try {
    const data = await anilistService.getTrending();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, error: 'Query parameter is required' });
    const data = await anilistService.searchAnime(query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/info/:id', async (req, res) => {
  try {
    const data = await anilistService.getAnimeInfo(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/watch/:episodeId', async (req, res) => {
  try {
    const data = await gogoExtractor.extractStream(req.params.episodeId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
