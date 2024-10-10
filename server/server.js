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

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)){
    fs.mkdirSync(screenshotsDir);
}

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

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

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: "new"
    });
//
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

// Update the zoom level to 20z for a closer view
const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}/@0,0,20z/data=!3m1!1e3`;
await page.goto(mapUrl, { waitUntil: 'networkidle0', timeout: 60000 });


    //
    // const page = await browser.newPage();
    // await page.setViewport({ width: 1280, height: 800 });

    // const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}/@0,0,15z/data=!3m1!1e3`;
    // await page.goto(mapUrl, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for any element that suggests the map has loaded
    await page.waitForSelector('button[aria-label="Satellite"], #widget-zoom-in, .widget-scene-canvas', 
      { visible: true, timeout: 60000 });

    // Ensure we're in satellite view
    await page.evaluate(() => {
      const satelliteButton = document.querySelector('button[aria-label="Satellite"]');
      if (satelliteButton && !satelliteButton.ariaPressed) {
        satelliteButton.click();
      }
    });

    await delay(5000);

    const screenshotPath = path.join(screenshotsDir, `${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    const screenshotUrl = `/screenshots/${path.basename(screenshotPath)}`;

    res.json({ 
      reply: address,
      screenshotUrl: screenshotUrl,
      mapUrl: mapUrl
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`LocateAI server running on http://localhost:${PORT}`);
});