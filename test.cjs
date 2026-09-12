const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', 'admin');
  await page.type('input[type="password"]', 'password123'); // or whatever the admin password is. Wait, mockUsers doesn't have password. 'password' might work. Let's try 'password123'
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.goto('http://localhost:5173/admin/orders');
  await new Promise(r => setTimeout(r, 1000));
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content.substring(0, 1000));
  
  const trs = await page.$$eval('tbody tr', rows => rows.length);
  console.log('Number of rows in tbody:', trs);
  
  const h2s = await page.$$eval('h2', els => els.map(e => e.innerText));
  console.log('H2s:', h2s);
  
  await browser.close();
})();
