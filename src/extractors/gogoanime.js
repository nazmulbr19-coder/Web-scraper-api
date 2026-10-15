// src/extractors/gogoanime.js
const axios = require('axios');
const cheerio = require('cheerio');

class GogoAnimeExtractor {
  constructor() {
    this.baseUrl = 'https://anitaku.pe'; // Active Gogoanime/Anitaku mirror
  }

  async extractStream(episodeId) {
    try {
      // 1. Fetch the main episode watch page
      const watchUrl = `${this.baseUrl}/${episodeId}`;
      const { data: pageHtml } = await axios.get(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      // 2. Parse HTML to find the video embed iframe URL
      const $ = cheerio.load(pageHtml);
      let iframeUrl = $('div.play-video iframe').attr('src');

      if (!iframeUrl) {
        return {
          success: false,
          error: 'Episode video stream iframe not found on source page'
        };
      }

      if (iframeUrl.startsWith('//')) {
        iframeUrl = `https:${iframeUrl}`;
      }

      // 3. Fetch the embed page HTML to locate the direct stream link or source parameters
      const { data: embedHtml } = await axios.get(iframeUrl, {
        headers: {
          'Referer': watchUrl,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      // 4. Extract direct .m3u8 link from embed scripts
      const m3u8Match = embedHtml.match(/(https:\/\/[^"]+\.m3u8[^"]*)/);

      if (m3u8Match && m3u8Match[1]) {
        return {
          success: true,
          episodeId: episodeId,
          sources: [
            {
              url: m3u8Match[1],
              quality: 'default',
              isM3U8: true
            }
          ]
        };
      }

      // If encrypted, return embed iframe URL as fallback for HTML video frames
      return {
        success: true,
        episodeId: episodeId,
        embedUrl: iframeUrl,
        sources: []
      };

    } catch (error) {
      return {
        success: false,
        error: `Scraper error: ${error.message}`
      };
    }
  }
}

module.exports = new GogoAnimeExtractor();

