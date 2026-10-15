const axios = require('axios');
const cheerio = require('cheerio');

class GogoAnimeExtractor {
  constructor() {
    this.baseUrl = 'https://anitaku.pe';
  }

  async extractStream(episodeId) {
    try {
      const watchUrl = `${this.baseUrl}/${episodeId}`;
      const { data: pageHtml } = await axios.get(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 5000
      });

      const $ = cheerio.load(pageHtml);
      let iframeUrl = $('div.play-video iframe').attr('src');

      if (!iframeUrl) {
        return {
          success: false,
          error: 'Stream frame not found'
        };
      }

      if (iframeUrl.startsWith('//')) {
        iframeUrl = `https:${iframeUrl}`;
      }

      return {
        success: true,
        episodeId: episodeId,
        embedUrl: iframeUrl,
        sources: []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GogoAnimeExtractor();
