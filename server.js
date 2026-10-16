const express = require('express');
const cors = require('cors');
const animeRoutes = require('./src/routes/anime.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/anime', animeRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Anime API is running successfully!',
    endpoints: {
      search: '/api/anime/search?query=naruto',
      info: '/api/anime/info?id=naruto',
      watch: '/api/anime/watch?episodeId=naruto-episode-1'
    }
  });
});

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
