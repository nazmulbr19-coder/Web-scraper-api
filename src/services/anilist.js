
const axios = require('axios');
const cache = require('../utils/cache');

const ANILIST_URL = 'https://graphql.anilist.co';

class AnilistService {
  async getTrending() {
    const cacheKey = 'anilist_trending';
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const query = `
      query {
        Page(page: 1, perPage: 15) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { romaji english native }
            coverImage { large color }
            episodes
            averageScore
            status
            genres
          }
        }
      }
    `;

    const response = await axios.post(ANILIST_URL, { query });
    const data = response.data.data.Page.media;
    cache.set(cacheKey, data);
    return data;
  }

  async searchAnime(searchQuery) {
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title { romaji english }
            coverImage { large }
            episodes
            description
          }
        }
      }
    `;

    const response = await axios.post(ANILIST_URL, { query, variables: { search: searchQuery } });
    return response.data.data.Page.media;
  }

  async getAnimeInfo(id) {
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

    const response = await axios.post(ANILIST_URL, { query, variables: { id: parseInt(id) } });
    return response.data.data.Media;
  }
}

module.exports = new AnilistService();
