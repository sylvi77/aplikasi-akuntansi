import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { transactions } = await request.json();
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "GANTI_DENGAN_GEMINI_API_KEY") {
      return NextResponse.json({ success: false, message: 'Kredensial Gemini API belum dikonfigurasi.' }, { status: 400 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: true, saran: ["Belum ada data transaksi yang cukup untuk dianalisis."] });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Rangkum transaksi (misal: hitung pengeluaran per kategori)
    const kategoriMap: Record<string, number> = {};
    let totalPengeluaran = 0;
    
    transactions.forEach((t: any) => {
      if (t.tipe === 'Pengeluaran') {
        kategoriMap[t.kategori] = (kategoriMap[t.kategori] || 0) + t.jumlah;
        totalPengeluaran += t.jumlah;
      }
    });

    const konteks = Object.entries(kategoriMap).map(([kat, jum]) => `- ${kat}: Rp ${jum.toLocaleString('id-ID')}`).join('\n');

    const prompt = `Anda adalah penasihat keuangan pribadi. Berikut adalah total pengeluaran pengguna selama 30 hari terakhir berdasarkan kategori:
${konteks}
Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}

Tugas Anda: Berikan TEPAT 3 saran penghematan yang spesifik, praktis, dan langsung dapat diterapkan berdasarkan data kategori pengeluaran terbesar tersebut.
Format output Anda harus berupa JSON murni (array of strings) tanpa awalan markdown \`\`\`json.
Contoh: ["Saran 1...", "Saran 2...", "Saran 3..."]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up markdown block if model still outputs it
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let saran = [];
    try {
      saran = JSON.parse(text);
    } catch (e) {
      // Fallback if not pure JSON
      saran = text.split('\n').filter(s => s.trim().length > 0).map(s => s.replace(/^\d+\.\s*/, '').replace(/^- \s*/, ''));
    }

    return NextResponse.json({ success: true, saran: saran.slice(0, 3) });
  } catch (error: any) {
    console.error('API Analyze Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
