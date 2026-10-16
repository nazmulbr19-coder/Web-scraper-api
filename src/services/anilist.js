const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';

async function searchAnime(query) {
  const gqlQuery = `
    query ($search: String) {
      Page (perPage: 15) {
        media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            color
          }
          episodes
          status
          description
          genres
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
    console.error('AniList API Error:', error.message);
    return [];
  }
}

async function getAnimeDetails(id) {
  const gqlQuery = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        description
        episodes
        genres
        status
        streamingEpisodes {
          title
          thumbnail
          url
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query: gqlQuery,
      variables: { id: Number(id) }
    });
    return response.data.data.Media;
  } catch (error) {
    console.error('AniList Details Error:', error.message);
    return null;
  }
}

module.exports = { searchAnime, getAnimeDetails };
