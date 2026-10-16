const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';

async function searchAnime(query) {
  const gqlQuery = `
    query ($search: String) {
      Page (perPage: 10) {
        media (search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          episodes
          status
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query: gqlQuery,
      variables: { search: query }
    });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Anilist API Error:', error.message);
    return [];
  }
}

module.exports = { searchAnime };
