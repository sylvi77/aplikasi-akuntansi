import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { transactions, saldoSekarang } = await request.json();
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "GANTI_DENGAN_GEMINI_API_KEY") {
      return NextResponse.json({ success: false, message: 'Kredensial Gemini API belum dikonfigurasi.' }, { status: 400 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: true, prediksi: "Data transaksi belum cukup untuk melakukan prediksi." });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Rangkum data (misal total pemasukan dan pengeluaran per bulan)
    // Untuk mempermudah, kita kirim daftar transaksi (yang sudah difilter oleh frontend misal 3 bulan terakhir)
    let pemasukanTotal = 0;
    let pengeluaranTotal = 0;
    
    transactions.forEach((t: any) => {
      if (t.tipe === 'Pemasukan') pemasukanTotal += t.jumlah;
      if (t.tipe === 'Pengeluaran') pengeluaranTotal += t.jumlah;
    });

    const prompt = `Anda adalah analis keuangan AI. 
Saldo pengguna saat ini adalah: Rp ${saldoSekarang.toLocaleString('id-ID')}.
Selama beberapa bulan terakhir, akumulasi pemasukan: Rp ${pemasukanTotal.toLocaleString('id-ID')} dan pengeluaran: Rp ${pengeluaranTotal.toLocaleString('id-ID')}.

Berdasarkan tren ini, berikan prediksi singkat (maksimal 2 kalimat) mengenai perkiraan saldo pengguna di akhir bulan depan dan apakah tren keuangannya sehat. Usahakan menyebutkan perkiraan angka spesifik berdasarkan selisih rata-rata pemasukan dan pengeluaran. Jangan gunakan formatting berlebihan, gunakan teks biasa.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ success: true, prediksi: text });
  } catch (error: any) {
    console.error('API Predict Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
