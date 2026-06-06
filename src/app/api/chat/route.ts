import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

// Singleton — built once per server cold-start, reused across requests.
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' }) ?? null;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'GANTI_DENGAN_GEMINI_API_KEY') {
      return NextResponse.json({
        success: false,
        message: 'Kredensial Gemini API belum dikonfigurasi.',
      }, { status: 400 });
    }

    // Fetch a compact summary from Supabase directly — no need for the client
    // to send raw transaction arrays over the wire anymore.
    const [totalsResult, recentResult] = await Promise.all([
      supabase
        .from('transaksi')
        .select('tipe, jumlah'),
      supabase
        .from('transaksi')
        .select('tanggal, deskripsi, kategori, tipe, jumlah')
        .order('tanggal', { ascending: false })
        .limit(5),
    ]);

    let contextData = 'Berikut adalah ringkasan data transaksi keuangan pengguna saat ini:\n';

    if (totalsResult.data && totalsResult.data.length > 0) {
      let totalPemasukan = 0;
      let totalPengeluaran = 0;
      totalsResult.data.forEach((t: any) => {
        if (t.tipe === 'Pemasukan') totalPemasukan += t.jumlah;
        else if (t.tipe === 'Pengeluaran') totalPengeluaran += t.jumlah;
      });

      contextData += `- Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}\n`;
      contextData += `- Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n`;
      contextData += `- Saldo Akhir: Rp ${(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}\n`;

      if (recentResult.data && recentResult.data.length > 0) {
        contextData += '\n5 Transaksi Terakhir:\n';
        recentResult.data.forEach((t: any, i: number) => {
          contextData += `${i + 1}. [${t.tanggal}] ${t.deskripsi} - ${t.kategori} (${t.tipe}): Rp ${t.jumlah.toLocaleString('id-ID')}\n`;
        });
      }
    } else {
      contextData += 'Belum ada data transaksi yang dicatat.\n';
    }

    const fullPrompt = `Anda adalah asisten keuangan pribadi bernama "KeuanganKu AI" yang cerdas dan ramah, dirancang untuk membantu pengguna mengelola keuangan mereka di Indonesia. Berikan jawaban dalam bahasa Indonesia.
    
${contextData}
    
Pertanyaan pengguna: ${prompt}
    
Jawablah dengan ringkas, informatif, dan solutif berdasarkan konteks data di atas.`;

    const result = await model!.generateContent(fullPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ success: true, text: responseText });
  } catch (error: any) {
    console.error('API POST Chat Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
