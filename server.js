const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- ANILIST API (Trending, Search & Info) ---
const ANILIST_URL = 'https://graphql.anilist.co';

async function fetchAniList(query, variables = {}) {
  try {
    const response = await axios.post(ANILIST_URL, { query, variables });
    return response.data.data;
  } catch (error) {
    throw new Error(`AniList API Error: ${error.message}`);
  }
}

// 1. Trending Route
app.get('/api/anime/trending', async (req, res) => {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 15) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { romaji english }
            coverImage { large }
            episodes
            status
            averageScore
          }
        }
      }
    `;
    const data = await fetchAniList(query);
    res.json({ success: true, data: data.Page.media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Search Route
app.get('/api/anime/search', async (req, res) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME) {
            id
            title { romaji english }
            coverImage { large }
            episodes
            status
          }
        }
      }
    `;
    const data = await fetchAniList(query, { search: searchQuery });
    res.json({ success: true, data: data.Page.media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Info Route
app.get('/api/anime/info/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english }
          description
          coverImage { large }
          episodes
          status
          genres
          studios { nodes { name } }
        }
      }
    `;
    const data = await fetchAniList(query, { id: animeId });
    res.json({ success: true, data: data.Media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Watch Route (Robust Custom Scraper)
app.get('/api/anime/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    const watchUrl = `https://anitaku.pe/${episodeId}`;
    
    const { data: pageHtml } = await axios.get(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://anitaku.pe/'
      },
      timeout: 6000
    });

    const $ = cheerio.load(pageHtml);
    
    // Check multiple common embed selectors used by streaming sources
    let iframeUrl = 
      $('div.play-video iframe').attr('src') \vert{}\vert{}$('div.anime_video_body iframe').attr('src') || 
      $('iframe.embed-responsive-item').attr('src') \vert{}\vert{}$('iframe').first().attr('src');

    if (!iframeUrl) {
      return res.status(404).json({ 
        success: false, 
        error: `Stream source unavailable for Episode: ${episodeId}` 
      });
    }

    if (iframeUrl.startsWith('//')) {
      iframeUrl = `https:${iframeUrl}`;
    }

    res.json({
      success: true,
      episodeId: episodeId,
      embedUrl: iframeUrl,
      sources: []
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: `Failed to fetch stream: ${error.message}` 
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Anime Streaming API is live!',
    endpoints: {
      trending: '/api/anime/trending',
      search: '/api/anime/search?query=naruto',
      info: '/api/anime/info/:id',
      watch: '/api/anime/watch/:episodeId'
    }
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
