const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static('screenshots'));

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)){
    fs.mkdirSync(screenshotsDir);
}

// Helper function for delay
function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

// GPT-4 chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are LocateAI, a helpful assistant that provides information about addresses in the USA. When asked about an address, respond with the full address in a clear format.' },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const address = response.data.choices[0].message.content;

    // Use Puppeteer to capture Google Maps screenshot
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://www.google.com/maps');
    await page.waitForSelector('#searchboxinput', { visible: true });
    await page.type('#searchboxinput', address);
    await page.keyboard.press('Enter');

    // Wait for navigation and then additional time for map to load
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await delay(3000);  // Wait for 3 seconds

    const screenshotPath = path.join(screenshotsDir, `${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    await browser.close();

    const screenshotUrl = `/screenshots/${path.basename(screenshotPath)}`;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    res.json({ 
      reply: address,
      screenshotUrl: screenshotUrl,
      mapUrl: mapUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`LocateAI server running on http://localhost:${PORT}`);
});