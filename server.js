const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'Server is running successfully!' });
});

// Mock trending route to test endpoint connection
app.get('/api/anime/trending', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      {
        id: 21,
        title: { romaji: "One Piece", english: "One Piece" },
        coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tX4Eux3QmJWX.jpg" },
        episodes: 1100,
        status: "RELEasING"
      }
    ] 
  });
});

module.exports = app;
