import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getGeminiModel, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!isGeminiConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Kredensial Gemini API belum dikonfigurasi.',
      }, { status: 400 });
    }

    const model = getGeminiModel('gemini-2.5-flash');

    // Fetch a compact summary from Supabase directly — no need for the client
    // to send raw transaction arrays over the wire anymore.
    // RLS will automatically isolate the data for the logged-in user.
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

    const todayDate = new Date().toISOString().split('T')[0];

    const fullPrompt = `Anda adalah asisten keuangan pribadi bernama "KeuanganKu AI" yang cerdas dan ramah.
Tugas Anda adalah:
1. Menjawab pertanyaan terkait keuangan.
2. Mendeteksi jika pesan pengguna adalah instruksi untuk mencatat/menyimpan transaksi keuangan (pemasukan atau pengeluaran).

Output Anda WAJIB berupa JSON valid dengan struktur berikut (tanpa markdown block, tanpa text lain di luar JSON):
{
  "isTransaction": boolean, // true jika pesan bermaksud mencatat transaksi, false jika pertanyaan biasa
  "message": string, // Balasan natural dari Anda untuk pengguna
  "transactionData": { // Wajib diisi jika isTransaction true
    "tipe": "Pemasukan" | "Pengeluaran",
    "kategori": "Food" | "Transportation" | "Entertainment" | "Shopping" | "Bills" | "Salary" | "Others",
    "jumlah": number, // Angka numerik murni
    "deskripsi": string, // Judul transaksi singkat
    "tanggal": string // Gunakan ${todayDate} jika tidak disebutkan
  }
}

Konteks data saat ini:
${contextData}
    
Pertanyaan pengguna: ${prompt}

Sekali lagi, balas HANYA dengan JSON yang valid sesuai struktur di atas.`;

    const result = await model.generateContent(fullPrompt);
    let responseText = result.response.text();
    
    // Clean up potential markdown formatting if the model still outputs it
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', responseText);
      return NextResponse.json({ success: false, message: 'Gagal memproses respon dari AI.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('API POST Chat Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
