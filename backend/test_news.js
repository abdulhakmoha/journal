const https = require('https');

function testFetch() {
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
      console.log('Successfully fetched news feed. Status:', res.statusCode);
      console.log('Length:', data.length);
      try {
        const json = JSON.parse(data);
        console.log('Parsed JSON items count:', json.length);
        console.log('Sample item:', json[0]);
      } catch (e) {
        console.error('JSON Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Error fetching news feed:', e.message);
  });

  req.end();
}

testFetch();
