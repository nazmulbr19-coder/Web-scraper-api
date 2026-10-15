const express = require('express');
const cors = require('cors');

const app = express();

// Explicit CORS configuration for mobile browsers and web apps
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Load routes
const animeRoutes = require('./src/routes/anime.routes');
app.use('/api/anime', animeRoutes);

// Root route
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

// Local listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
