const { GoogleSpreadsheet } = require("google-spreadsheet");
require('dotenv').config()

module.exports = class Sheet {
  constructor() {
    this.doc = new GoogleSpreadsheet(
      process.env.SHEET_ID
    );
  }
  async load() {
    await this.doc.useServiceAccountAuth({ client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY });
    await this.doc.loadInfo();
    console.log(this.doc.title);
  }
  async addRows(rows, pageIndex) {
    const sheet = this.doc.sheetsByIndex[pageIndex];
    await sheet.addRows(rows);
  }
};