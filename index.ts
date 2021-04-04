import fs from 'fs';
import path from 'path';
import { Filing, FinTen } from 'tsfinance';
import CSV from './CSV';

(async () => {
  try {
    //Create a new FinTen object (doesn't need initialization)
    const finten = new FinTen();

    //add your own credentials to get access to more data
    if (process.env.USERNAME && process.env.PASSWORD) {
      finten.username = process.env.USERNAME as string;
      finten.password = process.env.PASSWORD as string;
    }

    //explicitly login; this is called automatically when requesting data if
    //there is username and password info
    await finten.login();

    //request the list of available tickers
    //the response is a JSON object with a property called 'tickers', so we use
    //destructuring to get that property alone
    const { tickers } = await finten.getTickers();
    console.log('Tickers:', tickers);

    const data: Filing[] = [];
    for (const ticker of tickers) {
      //for each ticker in the list of tickers, get the filings available
      //the response is again a JSON object with a 'filings' property, so we use
      //destructuring again
      const { filings } = await finten.getFilings(ticker);
      console.log(`${ticker}:`, filings.length, 'filings');
      data.push(...filings);
    }

    //convert the filings to CSV and save them to a file
    console.log('Converting data to CSV...');
    const csv = new CSV(';').convert(data);
    console.log('Conversion finished! Writing to "data.csv"...');
    fs.writeFileSync(path.resolve(__dirname, 'data.csv'), csv);
    console.log('Done writing!');
  } catch (ex) {
    console.error(ex);
  }
})();
