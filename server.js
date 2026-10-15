const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const animeRoutes = require('./src/routes/anime.routes');
app.use('/api/anime', animeRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Anime Streaming API is running smoothly on Vercel!',
    endpoints: {
      trending: '/api/anime/trending',
      search: '/api/anime/search?query=naruto',
      info: '/api/anime/info/:id',
      watch: '/api/anime/watch/:episodeId'
    }
  });
});

// Local development listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}

module.exports = app;

