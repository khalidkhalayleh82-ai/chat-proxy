const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ORIGINAL_SERVER = 'https://www.pinalove.com';

app.post('/nt/app.php', async (req, res) => {
  try {
    let data = req.body;
    
    if (data.seconds && data.seconds == 600) {
      data.seconds = 10;
    }
    
    if (data.premiumstatus === '0' || data.premiumstatus === 0) {
      data.premiumstatus = '1';
    }
    
    if (data.pv === false || data.pv === 'false' || data.pv === 0) {
      data.pv = true;
    }
    
    if (data.gender === 'male') {
      data.gender = 'female';
    }
    
    data.brr = Math.random();
    
    const response = await axios({
      method: 'POST',
      url: ORIGINAL_SERVER + '/nt/app.php',
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': req.headers.cookie || '',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Android; Mobile)',
        'Host': 'www.pinalove.com',
        'Origin': 'https://www.pinalove.com',
        'Referer': 'https://www.pinalove.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });
    
    let responseData = response.data;
    
    if (typeof responseData === 'string') {
      try {
        const jsonResponse = JSON.parse(responseData);
        
        if (jsonResponse.seconds && jsonResponse.seconds > 10) {
          jsonResponse.seconds = 10;
        }
        
        if (jsonResponse.stat === 'limit') {
          jsonResponse.stat = 'sent';
          jsonResponse.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          jsonResponse.cnt = 1;
        }
        
        responseData = JSON.stringify(jsonResponse);
      } catch (e) {
        // Not JSON
      }
    }
    
    res.send(responseData);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    const fakeResponse = {
      stat: "sent",
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      cnt: 1
    };
    
    res.json(fakeResponse);
  }
});

app.get('/nt/app.php', async (req, res) => {
  try {
    const query = req.query;
    
    const response = await axios({
      method: 'GET',
      url: ORIGINAL_SERVER + '/nt/app.php',
      params: query,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Android; Mobile)',
        'Cookie': req.headers.cookie || '',
        'Host': 'www.pinalove.com',
        'Referer': 'https://www.pinalove.com/'
      },
      timeout: 10000
    });
    
    res.send(response.data);
    
  } catch (error) {
    console.error('GET error:', error.message);
    res.json({ stat: "error", message: "Proxy error" });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chat Proxy Server</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial; padding: 20px; background: #f0f0f0; }
        .box { background: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
        h1 { color: #333; }
        .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
        code { background: #eee; padding: 5px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Chat Proxy Server</h1>
        <div class="status">Server is running</div>
        <p>Original server: ${ORIGINAL_SERVER}</p>
        <p>Proxy endpoint: <code>/nt/app.php</code></p>
        <p id="url"></p>
      </div>
      <script>
        document.getElementById('url').textContent = 
          'Your proxy URL: ' + window.location.origin + '/nt/app.php';
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    originalServer: ORIGINAL_SERVER
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});