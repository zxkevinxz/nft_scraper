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
    const headers = await Promise.map(headerDataRowTitles, async (t) => t.evaluate((el) => el.textContent.trim()));

    for (let idx = 0; idx < nftData.length; idx++) {
      const nftsByDayRows = await nftData[idx].$$('tbody tr');
      const nfts = await Promise.map(nftsByDayRows, async (row) => {
        const rowData = await row.$$('td');
        const currentNft = {};
        for (let rowIdx = 0; rowIdx < rowData.length; rowIdx++) {
          if (rowIdx !== 1) currentNft[headers[rowIdx]] = await rowData[rowIdx].evaluate((el) => el.textContent.trim());
          const linkData = await rowData[rowIdx].$$('a');
          if (linkData.length > 0) {
            const links = await Promise.map(linkData, async (l) => l.evaluate((el) => el.href));
            currentNft[headers[rowIdx]] = links.join(' ');
            currentNft.Date = titles[idx];
          }
        }
        return currentNft;
      });
      await addToSheets(nfts, sheet);
      console.log(`NFTs for ${titles[idx]} added to sheet`);
    }

    await browser.close();
    process.exit(1);
  } catch (error) {
    console.log(error);
    browser.close();
    process.exit(1);
  }
}

async function addToSheets(rows, sheet) {
  await sheet.addRows(rows, 0);
}

start();
