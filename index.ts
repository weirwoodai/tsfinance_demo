import fs from 'fs';
import path from 'path';
import FinTen from 'tsfinance';
import Filing from 'tsfinance/dist/Filing.interface';
console.log('Hello, world!');

(async () => {
  try {
    const finten = new FinTen();

    finten.username = process.env.USERNAME as string;
    finten.password = process.env.PASSWORD as string;

    await finten.login();
    console.log(`Token is: ${finten.token}`);

    const { tickers } = await finten.getTickers();
    console.log('Tickers:', tickers);

    const data: Filing[] = [];
    for (const ticker of tickers) {
      const { filings } = await finten.getFilings(ticker);
      console.log(`Filings from ${ticker}:`, filings.length);
      data.push(...filings);
    }

    const csv = convertToCSV(data);

    fs.writeFileSync(path.resolve(__dirname, 'data.csv'), csv);
  } catch (ex) {
    console.error(ex);
  }
})();

function convertToCSV(data: any[]) {
  const containsAll = (a: any[], b: any[]) =>
    b.every((e: any) => a.includes(e));

  const sameMembers = (a: any[], b: any[]) =>
    containsAll(a, b) && containsAll(b, a);

  const headersReference = Object.keys(data[0]);

  return data
    .reduce(
      (t, d) => {
        const headers = Object.keys(d);
        if (!sameMembers(headersReference, headers)) {
          throw new Error('Different amount of fields!');
        }
        return [...t, Object.values(d).join(';')];
      },
      [headersReference.join(';')]
    )
    .join('\n');
}
