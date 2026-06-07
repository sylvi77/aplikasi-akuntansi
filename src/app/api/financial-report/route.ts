import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export interface FinancialReportData {
  periode: string;
  trialBalance: TrialBalanceRow[];
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlow;
  equityStatement: EquityStatement;
}

interface TrialBalanceRow {
  akun: string;
  kategori: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  debit: number;
  kredit: number;
}

interface IncomeStatement {
  pendapatan: { nama: string; jumlah: number }[];
  totalPendapatan: number;
  beban: { nama: string; jumlah: number }[];
  totalBeban: number;
  labaRugiBersih: number;
}

interface BalanceSheet {
  aset: { nama: string; jumlah: number }[];
  totalAset: number;
  kewajiban: { nama: string; jumlah: number }[];
  totalKewajiban: number;
  ekuitas: { nama: string; jumlah: number }[];
  totalEkuitas: number;
}

interface CashFlow {
  operasional: { nama: string; jumlah: number; tipe: string }[];
  totalMasuk: number;
  totalKeluar: number;
  arusKasBersih: number;
}

interface EquityStatement {
  modalAwal: number;
  tambahanModal: number;
  labaRugi: number;
  modalAkhir: number;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'bulanan'; // 'bulanan' | 'tahunan'
    const tahun = parseInt(searchParams.get('tahun') ?? String(new Date().getFullYear()));
    const bulan = parseInt(searchParams.get('bulan') ?? String(new Date().getMonth() + 1));

    // --- Date range ---
    let startDate: string;
    let endDate: string;
    let periodeLabel: string;

    if (mode === 'tahunan') {
      startDate = `${tahun}-01-01`;
      endDate = `${tahun}-12-31`;
      periodeLabel = `Tahun ${tahun}`;
    } else {
      const lastDay = new Date(tahun, bulan, 0).getDate();
      startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      endDate = `${tahun}-${String(bulan).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const namaBulan = new Date(tahun, bulan - 1, 1).toLocaleString('id-ID', { month: 'long' });
      periodeLabel = `${namaBulan} ${tahun}`;
    }

    // --- Fetch transactions for period ---
    const { data: transaksi, error } = await supabase
      .from('transaksi')
      .select('*')
      .eq('user_id', user.id)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: true });

    if (error) throw error;

    const rows = transaksi ?? [];

    // --- Fetch ALL transactions for equity (opening balance) ---
    const { data: allPrev } = await supabase
      .from('transaksi')
      .select('tipe, jumlah')
      .eq('user_id', user.id)
      .lt('tanggal', startDate);

    const prevRows = allPrev ?? [];
    const modalAwal = prevRows.reduce((sum, t) => {
      return t.tipe === 'Pemasukan' ? sum + t.jumlah : sum - t.jumlah;
    }, 0);

    // --- Group by kategori ---
    const byKategori: Record<string, { tipe: string; total: number }> = {};
    for (const t of rows) {
      if (!byKategori[t.kategori]) {
        byKategori[t.kategori] = { tipe: t.tipe, total: 0 };
      }
      byKategori[t.kategori].total += t.jumlah;
    }

    // ════════════════════════════════════
    // 1. TRIAL BALANCE
    // ════════════════════════════════════
    const trialBalance: TrialBalanceRow[] = Object.entries(byKategori).map(([kat, val]) => ({
      akun: kat,
      kategori: val.tipe === 'Pemasukan' ? 'Pendapatan' : 'Beban',
      tipe: val.tipe as 'Pemasukan' | 'Pengeluaran',
      debit: val.tipe === 'Pengeluaran' ? val.total : 0,
      kredit: val.tipe === 'Pemasukan' ? val.total : 0,
    }));

    // ════════════════════════════════════
    // 2. INCOME STATEMENT
    // ════════════════════════════════════
    const pendapatanList = Object.entries(byKategori)
      .filter(([, v]) => v.tipe === 'Pemasukan')
      .map(([kat, v]) => ({ nama: kat, jumlah: v.total }));

    const bebanList = Object.entries(byKategori)
      .filter(([, v]) => v.tipe === 'Pengeluaran')
      .map(([kat, v]) => ({ nama: kat, jumlah: v.total }));

    const totalPendapatan = pendapatanList.reduce((s, i) => s + i.jumlah, 0);
    const totalBeban = bebanList.reduce((s, i) => s + i.jumlah, 0);
    const labaRugiBersih = totalPendapatan - totalBeban;

    const incomeStatement: IncomeStatement = {
      pendapatan: pendapatanList,
      totalPendapatan,
      beban: bebanList,
      totalBeban,
      labaRugiBersih,
    };

    // ════════════════════════════════════
    // 3. BALANCE SHEET
    // ════════════════════════════════════
    const totalAset = modalAwal + labaRugiBersih;
    const balanceSheet: BalanceSheet = {
      aset: [
        { nama: 'Kas & Setara Kas', jumlah: Math.max(0, totalAset) },
      ],
      totalAset: Math.max(0, totalAset),
      kewajiban: [],
      totalKewajiban: 0,
      ekuitas: [
        { nama: 'Modal Pemilik', jumlah: modalAwal },
        { nama: 'Laba / Rugi Bersih Periode', jumlah: labaRugiBersih },
      ],
      totalEkuitas: modalAwal + labaRugiBersih,
    };

    // ════════════════════════════════════
    // 4. CASH FLOW
    // ════════════════════════════════════
    const cashFlowItems = rows.map((t) => ({
      nama: `${t.deskripsi} (${t.tanggal})`,
      jumlah: t.jumlah,
      tipe: t.tipe,
    }));

    const totalMasuk = rows
      .filter((t) => t.tipe === 'Pemasukan')
      .reduce((s, t) => s + t.jumlah, 0);
    const totalKeluar = rows
      .filter((t) => t.tipe === 'Pengeluaran')
      .reduce((s, t) => s + t.jumlah, 0);

    const cashFlow: CashFlow = {
      operasional: cashFlowItems,
      totalMasuk,
      totalKeluar,
      arusKasBersih: totalMasuk - totalKeluar,
    };

    // ════════════════════════════════════
    // 5. EQUITY STATEMENT
    // ════════════════════════════════════
    const equityStatement: EquityStatement = {
      modalAwal,
      tambahanModal: totalPendapatan,
      labaRugi: labaRugiBersih,
      modalAkhir: modalAwal + labaRugiBersih,
    };

    const report: FinancialReportData = {
      periode: periodeLabel,
      trialBalance,
      incomeStatement,
      balanceSheet,
      cashFlow,
      equityStatement,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Financial Report Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
