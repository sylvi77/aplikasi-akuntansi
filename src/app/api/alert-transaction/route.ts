import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getGeminiModel, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { tanggal, deskripsi, tipe, jumlah, kategori } = await request.json();

    if (!jumlah || !tipe) {
      return NextResponse.json({ success: true, isAlert: false });
    }

    // --- Fetch historical transactions of the same type ---
    const { data: historis } = await supabase
      .from('transaksi')
      .select('jumlah')
      .eq('tipe', tipe)
      .lt('tanggal', tanggal);

    const histData: number[] = (historis ?? []).map((t: any) => t.jumlah);

    // --- Not enough data: use flat threshold ---
    const FLAT_THRESHOLD = 5_000_000;
    let isAlert = false;
    let severity: 'low' | 'medium' | 'high' = 'low';
    let threshold = FLAT_THRESHOLD;

    if (histData.length < 5) {
      isAlert = jumlah > FLAT_THRESHOLD;
      severity = jumlah > FLAT_THRESHOLD * 5 ? 'high' : jumlah > FLAT_THRESHOLD * 2 ? 'medium' : 'low';
    } else {
      const rata = histData.reduce((s, v) => s + v, 0) / histData.length;
      const variance = histData.reduce((s, v) => s + Math.pow(v - rata, 2), 0) / histData.length;
      const stdDev = Math.sqrt(variance);

      const thresholdHigh = rata + 3 * stdDev;
      const thresholdMedium = rata + 2 * stdDev;
      const thresholdLow = rata + 1.5 * stdDev;

      threshold = thresholdLow;

      if (jumlah > thresholdHigh) {
        isAlert = true;
        severity = 'high';
      } else if (jumlah > thresholdMedium) {
        isAlert = true;
        severity = 'medium';
      } else if (jumlah > thresholdLow) {
        isAlert = true;
        severity = 'low';
      }
    }

    if (!isAlert) {
      return NextResponse.json({ success: true, isAlert: false });
    }

    // --- Generate AI warning message ---
    let message = `Transaksi "${deskripsi}" sebesar Rp ${jumlah.toLocaleString('id-ID')} terdeteksi tidak biasa.`;

    if (isGeminiConfigured) {
      try {
        const model = getGeminiModel('gemini-2.5-flash');
        const rataStr = histData.length >= 5
          ? `Rata-rata transaksi ${tipe} sebelumnya: Rp ${Math.round(histData.reduce((s,v)=>s+v,0)/histData.length).toLocaleString('id-ID')}.`
          : `Threshold standar: Rp ${FLAT_THRESHOLD.toLocaleString('id-ID')}.`;

        const prompt = `Anda adalah asisten keuangan pribadi yang cerdas. Seorang pengguna baru saja mencatat transaksi berikut:
- Deskripsi: "${deskripsi}"
- Tipe: ${tipe}
- Jumlah: Rp ${jumlah.toLocaleString('id-ID')}
- Kategori: ${kategori}
- Tanggal: ${tanggal}
${rataStr}
Jumlah ini jauh di atas normal (tingkat keparahan: ${severity === 'high' ? 'TINGGI' : severity === 'medium' ? 'SEDANG' : 'RENDAH'}).

Tugas Anda: Berikan peringatan singkat (maksimal 2-3 kalimat) dalam bahasa Indonesia yang ramah namun tegas. Sebutkan jumlahnya, kenapa ini perlu diperhatikan, dan 1 saran praktis. Jangan gunakan formatting markdown.`;

        const result = await model.generateContent(prompt);
        message = result.response.text().trim();
      } catch {
        // Fallback to default message if AI fails
      }
    }

    return NextResponse.json({
      success: true,
      isAlert: true,
      severity,
      message,
      threshold,
    });
  } catch (error: any) {
    console.error('Alert Transaction Error:', error);
    return NextResponse.json({ success: false, isAlert: false, message: error.message }, { status: 500 });
  }
}
