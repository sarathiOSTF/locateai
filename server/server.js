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

// ... (previous code remains the same)


app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
  
    try {
      console.log('Received message:', message);
  
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
  
      const fullResponse = response.data.choices[0].message.content;
      console.log('Full response:', fullResponse);
  
      // Extract just the address part from the full response
      const addressMatch = fullResponse.match(/(?:The full address (?:you requested|is)(?:\s*is)?:?\s*)(.+?)(?:\s*\.?\s*$)/i);
      const address = addressMatch ? addressMatch[1].trim() : fullResponse.trim();
      console.log('Extracted address:', address);
  
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
        defaultViewport: null
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
  
      const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
      console.log('Navigating to:', mapUrl);
      await page.goto(mapUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  
      console.log('Waiting for map to load...');
      await page.waitForSelector('#searchbox', { visible: true, timeout: 60000 });
      
      console.log('Attempting to switch to satellite view...');
      await page.evaluate(() => {
        const satelliteButton = document.querySelector('button[aria-labelledby="widget-minimap-icon-overlay"]');
        if (satelliteButton) {
          satelliteButton.click();
          console.log('Satellite view button clicked');
        } else {
          console.log('Satellite view button not found');
        }
      });
      
      console.log('Waiting for satellite view to load...');
      await delay(3000);
  
      console.log('Attempting to zoom in...');
      const zoomInButton = await page.$('button[aria-label="Zoom in"]');
      for (let i = 0; i < 5; i++) {
        if (zoomInButton) {
          await zoomInButton.click();
          await delay(1000);
        }
      }
  
      console.log('Waiting for the zoomed view to stabilize...');
      await delay(3000);

      console.log('Attempting to collapse side panel...');
await page.evaluate(() => {
    const collapseButton = document.querySelector('button.yra0jd.Hk4XGb[aria-label="Collapse side panel"]');
//   const collapseButton = document.querySelector('button[aria-label="Collapse side panel"]');
  if (collapseButton) {
    collapseButton.click();
    console.log('Side panel collapse button clicked');
  } else {
    console.log('Side panel collapse button not found');
  }
});

// Wait for the panel to collapse
await delay(2000);
  
      console.log('Taking screenshot...');
      const screenshotPath = path.join(screenshotsDir, `${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log('Screenshot taken:', screenshotPath);
  
      await browser.close();
  
      const screenshotUrl = `/screenshots/${path.basename(screenshotPath)}`;
  
      res.json({ 
        reply: fullResponse,
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