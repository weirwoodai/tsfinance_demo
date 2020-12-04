import fs from 'fs';
import path from 'path';
import FinTen from 'tsfinance';
import Filing from 'tsfinance/dist/Filing.interface';
import CSV from './CSV';

(async () => {
  try {
    const finten = new FinTen();

    finten.username = process.env.USERNAME as string;
    finten.password = process.env.PASSWORD as string;

    await finten.login();
    const { tickers } = await finten.getTickers();
    console.log('Tickers:', tickers);

    const data: Filing[] = [];
    for (const ticker of tickers) {
      const { filings } = await finten.getFilings(ticker);
      console.log(`${ticker}:`, filings.length, 'filings');
      data.push(...filings);
    }

    console.log('Converting data to CSV...');
    const csv = new CSV(';').convert(data);
    console.log('Conversion finished! Writing to "data.csv"...');
    fs.writeFileSync(path.resolve(__dirname, 'data.csv'), csv);
    console.log('Done writing!');
  } catch (ex) {
    console.error(ex);
  }
})();
