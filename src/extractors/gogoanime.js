const axios = require('axios');
const cheerio = require('cheerio');
const cache = require('../utils/cache');

const BASE_URL = 'https://anitaku.pe';

async function searchGogoanime(query) {
  const cacheKey = `search_${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/search.html?keyword=${encodeURIComponent(query)}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(data);
    const results = [];

    $('.items li').each((_, element) => {
      const title = $(element).find('.name a').text().trim();
      const animeId = $(element).find('.name a').attr('href')?.split('/')[2];
      const image = $(element).find('.img img').attr('src');
      const releaseDate = $(element).find('.released').text().trim();

      if (animeId) {
        results.push({ id: animeId, title, image, releaseDate });
      }
    });

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Gogoanime Search Error:', error.message);
    return [];
  }
}

async function getAnimeDetails(animeId) {
  const cacheKey = `details_${animeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${BASE_URL}/category/${animeId}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
      }
    });
    const $ = cheerio.load(data);

    const title = $('.anime_info_body_bg h1').text().trim();
    const image = $('.anime_info_body_bg img').attr('src');
    const synopsis = $('.description').text().trim();
    
    const genres = [];
    $('.anime_info_body_bg p').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Genre:')) {
        $(el).find('a').each((__, a) => genres.push($(a).text().trim()));
      }
    });

    const anime_id = $('#movie_id').val();
    const alias = $('#alias_anime').val();

    if (!anime_id) {
      return { error: 'Blocked by anti-bot protection or anime not found' };
    }

    const epResponse = await axios.get(`https://ajax.gogocdn.net/ajax/load-list-episode?ep_start=0&ep_end=9999&id=${anime_id}&default_ep=0&alias=${alias}`);
    const $$ = cheerio.load(epResponse.data); const episodes = [];      $$('li').each((_, el) => {
      const epId = $$(el).find('a').attr('href')?.trim().split('/')[1]; const epNum = $$(el).find('.name').text().replace('EP', '').trim();
      if (epId) {
        episodes.push({ episodeId: epId, episodeNumber: Number(epNum) });
      }
    });

    const details = { id: animeId, title, image, synopsis, genres, episodes: episodes.reverse() };
    cache.set(cacheKey, details);
    return details;
  } catch (error) {
    console.error('Gogoanime Details Error:', error.message);
    return null;
  }
}

async function getEpisodeSources(episodeId) {
  const cacheKey = `sources_${episodeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const targetUrl = `${BASE_URL}/${episodeId}`;
    const { data } = await axios.get(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': BASE_URL
      }
    });
    const $ = cheerio.load(data);
    let embedUrl = $('div.play-video iframe').attr('src');

    // Fallback search if class names changed
    if (!embedUrl) {
      embedUrl = $('iframe').attr('src');
    }

    if (!embedUrl) {
      return { 
        error: 'Video stream source blocked or not found', 
        details: 'The target site is returning a Cloudflare challenge block against Vercel cloud IPs.' 
      };
    }

    const fullEmbedUrl = embedUrl.startsWith('http') ? embedUrl : `https:${embedUrl}`;

    const sources = {
      embedUrl: fullEmbedUrl,
      headers: { Referer: BASE_URL }
    };

    cache.set(cacheKey, sources);
    return sources;
  } catch (error) {
    console.error('Gogoanime Sources Error:', error.message);
    return { error: 'Failed to fetch video stream sources due to server block' };
  }
}

module.exports = { searchGogoanime, getAnimeDetails, getEpisodeSources };
