const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const pageUrl = 'file:\\\\C:\\Users\\kevin\\code\\nft_scraper\\nft.html';

async function start() {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl);

    const mainPageData = await page.$('.col');

    const titleData = await mainPageData.$$('.title');
    const nftData = await mainPageData.$$('.table-responsive');
    console.log(titleData.length, nftData.length);
    const titles = await Promise.map(titleData, async (t) => {
      return t.evaluate(el => el.textContent.trim());
    })
    const headerDataRow = await nftData[0].$('thead tr');
    const headerDataRowTitles = await headerDataRow.$$('th');
    const headers = await Promise.map(headerDataRowTitles, async (t) => {return t.evaluate(el => el.textContent.trim())});


    const allNfts = [];
    for (let idx = 0; idx < nftData.length; idx++) {
      let nftsByDay = await Promise.map(nftData, async (data) => {
        const nftRows = await data.$$('tbody tr');
        const nfts = await Promise.map(nftRows, async (row) => {
          const rowData = await row.$$('td');
          let currentNft = {};
          for (let rowIdx = 0; rowIdx < rowData.length; rowIdx++) {
            if (rowIdx !== 1) currentNft[headers[rowIdx]] = await rowData[rowIdx].evaluate(el => el.textContent.trim());
            let linkData = await rowData[rowIdx].$$('a');
            if (linkData.length > 0) {
              let links = await Promise.map(linkData, async (l) => {return l.evaluate(el => el.href)})
              currentNft[headers[rowIdx]] = links.join(' ');
              currentNft.Date = titles[idx];
            }
          }
          console.log(currentNft);
          return currentNft;
        })
        return nfts;
      })
      allNfts.push(nftsByDay);
    }
    console.log(allNfts);
  
    await browser.close();
    process.exit(1);    
  } catch (error) {
    console.log(error);
    browser.close();
    process.exit(1); 
  }

}

start();

