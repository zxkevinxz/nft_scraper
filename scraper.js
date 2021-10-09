/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const Sheet = require('./Sheet');

const pageUrl = 'https://howrare.is/drops';

async function start() {
  const browser = await puppeteer.launch();
  const sheet = new Sheet();
  await sheet.load();
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl);

    const mainPageData = await page.$('.col');

    const titleData = await mainPageData.$$('.title');
    const nftData = await mainPageData.$$('.table-responsive');
    const titles = await Promise.map(titleData, async (t) => {
      const title = await t.evaluate((el) => el.textContent);
      return title.trim();
    });
    const headerDataRow = await nftData[0].$('thead tr');
    const headerDataRowTitles = await headerDataRow.$$('th');
    const headers = await Promise.map(headerDataRowTitles,
      async (t) => t.evaluate((el) => el.textContent.trim()));
    const nfts = [];
    await Promise.map(nftData, async (day, idx) => {
      const nftDate = titles[idx];
      const nftsByDayRows = await day.$$('tbody tr');
      const nftByDay = await Promise.map(nftsByDayRows, async (row) => {
        const currentNft = {};
        currentNft.Date = nftDate;
        const rowData = await row.$$('td');
        currentNft[headers[0]] = await rowData[0].evaluate((el) => el.textContent.trim());
        const linkData = await rowData[1].$$('a');
        const links = await Promise.map(linkData, async (l) => l.evaluate((el) => el.href));
        currentNft[headers[1]] = links.join(' ');
        Promise.each(rowData.slice(2), async (data, i) => {
          currentNft[headers[i + 2]] = await data.evaluate((el) => el.textContent.trim());
        });
        return currentNft;
      });
      nfts.push(...nftByDay);
    });
    await sheet.addRows(nfts, 0);
    await browser.close();
    process.exit(1);
  } catch (error) {
    console.log(error);
    browser.close();
    process.exit(1);
  }
}

start();
