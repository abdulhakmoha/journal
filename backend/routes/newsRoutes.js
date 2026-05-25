const express = require('express');
const https = require('https');
const router = express.Router();

let cachedNews = null;
let lastFetched = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function fetchNewsFromSource() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nfs.faireconomy.media',
      path: '/ff_calendar_thisweek.json',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse news JSON'));
          }
        } else {
          reject(new Error(`Failed to fetch news. Status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Function that other routes can import to get news for correlation
async function getNewsCalendar() {
  const now = Date.now();
  if (cachedNews && lastFetched && (now - lastFetched < CACHE_DURATION)) {
    return cachedNews;
  }

  try {
    const freshNews = await fetchNewsFromSource();
    cachedNews = freshNews;
    lastFetched = now;
    console.log('✅ Successfully refreshed economic calendar cache.');
    return cachedNews;
  } catch (error) {
    console.error('❌ Error updating news cache:', error.message);
    // If update fails, return stale cache if available, otherwise return empty array
    return cachedNews || [];
  }
}

// @route   GET api/news
router.get('/', async (req, res) => {
  try {
    const news = await getNewsCalendar();
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving news calendar data' });
  }
});

module.exports = {
  router,
  getNewsCalendar
};
