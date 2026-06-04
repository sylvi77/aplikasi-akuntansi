import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1]] = val;
  }
});

const SPREADSHEET_ID = env.GOOGLE_SPREADSHEET_ID || '';
const CLIENT_EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

async function clearDatabase() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("Missing Google Sheets credentials in .env.local");
    process.exit(1);
  }

  const serviceAccountAuth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  console.log(`Loaded spreadsheet: ${doc.title}`);

  for (const sheetTitle of ['Transaksi', 'Budgets']) {
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (sheet) {
      console.log(`Clearing sheet: ${sheetTitle}...`);
      await sheet.clearRows();
      console.log(`Cleared ${sheetTitle}.`);
    }
  }

  console.log("Database cleared successfully!");
}

clearDatabase().catch(console.error);
