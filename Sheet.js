const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

module.exports = class Sheet {
  constructor() {
    this.doc = new GoogleSpreadsheet(
      process.env.SHEET_ID,
    );
  }

  async load() {
    await this.doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await this.doc.loadInfo();
  }

  async addRows(rows) {
    if (rows.length > 0) {
      const sheet = this.doc.sheetsByIndex[0];
      await sheet.clear();
      await sheet.setHeaderRow(Object.keys(rows[0]));
      await sheet.addRows(rows);
    }
  }
};
