import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
// Handle newline characters in the private key from .env properly
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

// Initialize auth
const serviceAccountAuth = new JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getSpreadsheet = async () => {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY || SPREADSHEET_ID === "GANTI_DENGAN_SPREADSHEET_ID") {
    console.error("Missing Google Sheets credentials in .env.local");
    return null;
  }
  
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    return doc;
  } catch (error) {
    console.error("Error loading Google Spreadsheet:", error);
    return null;
  }
};

// Helper function to get or create a sheet
export const getSheet = async (doc: GoogleSpreadsheet, title: string, headerValues: string[] = ['id', 'tanggal', 'deskripsi', 'tipe', 'jumlah', 'kategori', 'createdAt']) => {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ 
      headerValues, 
      title 
    });
  }
  return sheet;
};
