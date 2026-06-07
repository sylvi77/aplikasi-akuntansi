import { NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { transactions, saldoSekarang } = await request.json();

    if (!isGeminiConfigured) {
      return NextResponse.json({ success: false, message: 'Kredensial Gemini API belum dikonfigurasi.' }, { status: 400 });
    }

    const model = getGeminiModel('gemini-2.5-flash');

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: true, prediksi: 'Data transaksi belum cukup untuk melakukan prediksi.' });
    }

    // Compute totals server-side — no need to send raw rows to the AI.
    let pemasukanTotal = 0;
    let pengeluaranTotal = 0;

    transactions.forEach((t: any) => {
      if (t.tipe === 'Pemasukan') pemasukanTotal += t.jumlah;
      if (t.tipe === 'Pengeluaran') pengeluaranTotal += t.jumlah;
    });

    const prompt = `Anda adalah analis keuangan AI. \nSaldo pengguna saat ini adalah: Rp ${saldoSekarang.toLocaleString('id-ID')}.\nSelama beberapa bulan terakhir, akumulasi pemasukan: Rp ${pemasukanTotal.toLocaleString('id-ID')} dan pengeluaran: Rp ${pengeluaranTotal.toLocaleString('id-ID')}.\n\nBerdasarkan tren ini, berikan prediksi singkat (maksimal 2 kalimat) mengenai perkiraan saldo pengguna di akhir bulan depan dan apakah tren keuangannya sehat. Usahakan menyebutkan perkiraan angka spesifik berdasarkan selisih rata-rata pemasukan dan pengeluaran. Jangan gunakan formatting berlebihan, gunakan teks biasa.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ success: true, prediksi: text });
  } catch (error: any) {
    console.error('API Predict Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
