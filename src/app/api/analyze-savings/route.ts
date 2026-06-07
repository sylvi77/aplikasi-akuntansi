import { NextResponse } from 'next/server';
import { generateWithFallback, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { transactions } = await request.json();

    if (!isGeminiConfigured) {
      return NextResponse.json({ success: false, message: 'Kredensial Gemini API belum dikonfigurasi.' }, { status: 400 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: true, saran: ['Belum ada data transaksi yang cukup untuk dianalisis.'] });
    }

    // Summarise by category — only send totals to the AI, not raw rows.
    const kategoriMap: Record<string, number> = {};
    let totalPengeluaran = 0;

    transactions.forEach((t: any) => {
      if (t.tipe === 'Pengeluaran') {
        kategoriMap[t.kategori] = (kategoriMap[t.kategori] || 0) + t.jumlah;
        totalPengeluaran += t.jumlah;
      }
    });

    const konteks = Object.entries(kategoriMap)
      .map(([kat, jum]) => `- ${kat}: Rp ${jum.toLocaleString('id-ID')}`)
      .join('\n');

    const prompt = `Anda adalah penasihat keuangan pribadi. Berikut adalah total pengeluaran pengguna selama 30 hari terakhir berdasarkan kategori:\n${konteks}\nTotal Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n\nTugas Anda: Berikan TEPAT 3 saran penghematan yang spesifik, praktis, dan langsung dapat diterapkan berdasarkan data kategori pengeluaran terbesar tersebut.\nFormat output Anda harus berupa JSON murni (array of strings) tanpa awalan markdown \`\`\`json.\nContoh: ["Saran 1...", "Saran 2...", "Saran 3..."]`;

    let text = (await generateWithFallback(prompt, 'gemini-2.5-flash')).trim();

    // Clean up markdown block if model still outputs it
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let saran: string[] = [];
    try {
      saran = JSON.parse(text);
    } catch {
      // Fallback if not pure JSON
      saran = text
        .split('\n')
        .filter((s) => s.trim().length > 0)
        .map((s) => s.replace(/^\d+\.\s*/, '').replace(/^-\s*/, ''));
    }

    return NextResponse.json({ success: true, saran: saran.slice(0, 3) });
  } catch (error: any) {
    console.error('API Analyze Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
