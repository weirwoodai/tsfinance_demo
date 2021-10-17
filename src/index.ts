import { promises as fs } from 'fs';
import path from 'path';
import { Filing, FinTen } from '@weirwoodai/tsfinance';
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
    //there is username and password info, and if there isn't, the account with
    //limited access of 'tsfinance' is used instead
    await finten.login();

    //request the list of available tickers
    //the response is a JSON object with a property called 'tickers'
    const desiredTickers = ['AAPL', 'MSFT', 'FB', 'GOOG'];
    const { tickers } = await finten.getTickers();
    console.log('Tickers:', tickers);

    const data: Filing[] = [];
    for (const ticker of tickers) {
      if (!desiredTickers.includes(ticker)) continue;
      //for each ticker in the list of tickers, get the filings available
      //the response is again a JSON object with a 'filings' property
      const { filings } = await finten.getFilings(ticker);
      console.log(`${ticker}: ${filings.length} filings`);
      data.push(...filings);
    }

    //convert the filings to CSV and save them to a file
    console.log('Converting data to CSV...');
    const csv = new CSV(';').convert(data);
    console.log('Conversion finished! Writing to "data.csv"...');
    await fs.writeFile(path.resolve(__dirname, 'data.csv'), csv);
    console.log('Done writing!');

    // Get stock prices
    const tsla = await Promise.all([
      finten.getPrices('TSLA'),
      finten.getPrices('TSLA', { start: '2020-07-01' }),
      finten.getPrices('TSLA', { start: '2020-07-01', end: '2020-08-01' })
    ]);
    // just to show that using different periods we get different amounts of
    // data, we print the length of the response array of each call
    console.log({ tsla: tsla.map(({ length }) => length) });
  } catch (ex) {
    console.error(ex);
  }
})();
