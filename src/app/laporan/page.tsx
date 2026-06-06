"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  Download,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Scale,
  Droplets,
  Landmark,
} from "lucide-react";
import type { FinancialReportData } from "@/app/api/financial-report/route";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const TAHUN_LIST = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

type Tab = "trial" | "income" | "balance" | "cashflow" | "equity";

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: "trial",     label: "Trial Balance",     Icon: Scale },
  { id: "income",    label: "Income Statement",   Icon: TrendingUp },
  { id: "balance",   label: "Balance Sheet",      Icon: Landmark },
  { id: "cashflow",  label: "Cash Flow",          Icon: Droplets },
  { id: "equity",    label: "Equity Statement",   Icon: TrendingDown },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 pb-4 border-b-2 border-slate-200">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function TableRow({
  label,
  value,
  isTotal = false,
  isNegative = false,
  indent = false,
}: {
  label: string;
  value: number;
  isTotal?: boolean;
  isNegative?: boolean;
  indent?: boolean;
}) {
  const color = isNegative
    ? "text-red-600"
    : value >= 0
    ? "text-slate-800"
    : "text-red-600";

  return (
    <tr className={`${isTotal ? "border-t-2 border-slate-300 bg-slate-50 font-bold" : "border-t border-slate-100 hover:bg-slate-50"} transition-colors`}>
      <td className={`py-3 px-4 text-sm ${isTotal ? "font-bold text-slate-800" : "text-slate-600"} ${indent ? "pl-10" : ""}`}>
        {indent && <ChevronRight size={12} className="inline mr-1 text-slate-400" />}
        {label}
      </td>
      <td className={`py-3 px-4 text-sm text-right font-medium ${isTotal ? "text-slate-800" : color}`}>
        {fmt(Math.abs(value))}
        {value < 0 && !isNegative && <span className="text-xs text-red-500 ml-1">(rugi)</span>}
      </td>
    </tr>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function TrialBalance({ data }: { data: FinancialReportData }) {
  const totalDebit = data.trialBalance.reduce((s, r) => s + r.debit, 0);
  const totalKredit = data.trialBalance.reduce((s, r) => s + r.kredit, 0);

  return (
    <div>
      <SectionHeader
        title="Trial Balance"
        subtitle={`Neraca Saldo — Periode: ${data.periode}`}
      />
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Akun / Kategori</th>
              <th className="py-3 px-4 text-left font-semibold">Jenis</th>
              <th className="py-3 px-4 text-right font-semibold">Debit (Rp)</th>
              <th className="py-3 px-4 text-right font-semibold">Kredit (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {data.trialBalance.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">Tidak ada transaksi pada periode ini.</td>
              </tr>
            ) : (
              data.trialBalance.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">{row.akun}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.tipe === "Pemasukan" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {row.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 font-medium">{row.debit > 0 ? fmt(row.debit) : "—"}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">{row.kredit > 0 ? fmt(row.kredit) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold">
            <tr>
              <td className="py-3 px-4 text-slate-800" colSpan={2}>TOTAL</td>
              <td className="py-3 px-4 text-right text-red-700">{fmt(totalDebit)}</td>
              <td className="py-3 px-4 text-right text-green-700">{fmt(totalKredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function IncomeStatementPanel({ data }: { data: FinancialReportData }) {
  const is = data.incomeStatement;
  const isProfit = is.labaRugiBersih >= 0;

  return (
    <div>
      <SectionHeader
        title="Laporan Laba Rugi"
        subtitle={`Income Statement — Periode: ${data.periode}`}
      />
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Keterangan</th>
              <th className="py-3 px-4 text-right font-semibold">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50">
              <td className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-green-700" colSpan={2}>Pendapatan</td>
            </tr>
            {is.pendapatan.map((p, i) => (
              <TableRow key={i} label={p.nama} value={p.jumlah} indent />
            ))}
            <TableRow label="Total Pendapatan" value={is.totalPendapatan} isTotal />

            <tr className="bg-red-50">
              <td className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-red-700" colSpan={2}>Beban</td>
            </tr>
            {is.beban.map((b, i) => (
              <TableRow key={i} label={b.nama} value={b.jumlah} indent />
            ))}
            <TableRow label="Total Beban" value={is.totalBeban} isTotal />
          </tbody>
          <tfoot>
            <tr className={`border-t-2 ${isProfit ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"}`}>
              <td className={`py-4 px-4 font-bold text-base ${isProfit ? "text-green-800" : "text-red-800"}`}>
                {isProfit ? "✅ Laba Bersih" : "❌ Rugi Bersih"}
              </td>
              <td className={`py-4 px-4 font-bold text-base text-right ${isProfit ? "text-green-800" : "text-red-800"}`}>
                {fmt(Math.abs(is.labaRugiBersih))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function BalanceSheetPanel({ data }: { data: FinancialReportData }) {
  const bs = data.balanceSheet;

  return (
    <div>
      <SectionHeader
        title="Neraca (Balance Sheet)"
        subtitle={`Posisi Keuangan per akhir periode: ${data.periode}`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASET */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-blue-700 text-white py-2 px-4 text-sm font-bold">ASET</div>
          <table className="w-full">
            <tbody>
              {bs.aset.map((a, i) => (
                <TableRow key={i} label={a.nama} value={a.jumlah} indent />
              ))}
              <TableRow label="Total Aset" value={bs.totalAset} isTotal />
            </tbody>
          </table>
        </div>
        {/* KEWAJIBAN + EKUITAS */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-indigo-700 text-white py-2 px-4 text-sm font-bold">KEWAJIBAN & EKUITAS</div>
          <table className="w-full">
            <tbody>
              {bs.kewajiban.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td className="py-3 px-10 text-sm text-slate-400 italic">Tidak ada kewajiban tercatat.</td>
                </tr>
              )}
              {bs.kewajiban.map((k, i) => (
                <TableRow key={i} label={k.nama} value={k.jumlah} indent />
              ))}
              <TableRow label="Total Kewajiban" value={bs.totalKewajiban} isTotal />
              <tr className="bg-slate-50">
                <td className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500" colSpan={2}>Ekuitas</td>
              </tr>
              {bs.ekuitas.map((e, i) => (
                <TableRow key={i} label={e.nama} value={e.jumlah} indent />
              ))}
              <TableRow label="Total Ekuitas" value={bs.totalEkuitas} isTotal />
              <TableRow label="Total Kewajiban + Ekuitas" value={bs.totalKewajiban + bs.totalEkuitas} isTotal />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CashFlowPanel({ data }: { data: FinancialReportData }) {
  const cf = data.cashFlow;
  const isPositive = cf.arusKasBersih >= 0;
  const pemasukan = cf.operasional.filter(o => o.tipe === "Pemasukan");
  const pengeluaran = cf.operasional.filter(o => o.tipe === "Pengeluaran");

  return (
    <div>
      <SectionHeader
        title="Laporan Arus Kas"
        subtitle={`Cash Flow Statement — Periode: ${data.periode}`}
      />

      <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-4 ${isPositive ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
        <div className={`text-4xl font-bold ${isPositive ? "text-green-700" : "text-red-700"}`}>
          {isPositive ? "+" : "−"}{fmt(Math.abs(cf.arusKasBersih))}
        </div>
        <div>
          <p className={`font-semibold ${isPositive ? "text-green-800" : "text-red-800"}`}>
            Arus Kas Bersih — {isPositive ? "Positif ✅" : "Negatif ⚠️"}
          </p>
          <p className="text-sm text-slate-600">Kas Masuk: {fmt(cf.totalMasuk)} · Kas Keluar: {fmt(cf.totalKeluar)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-green-200 overflow-hidden">
          <div className="bg-green-700 text-white py-2 px-4 text-sm font-bold">KAS MASUK (Pemasukan)</div>
          <table className="w-full">
            <tbody>
              {pemasukan.length === 0 ? (
                <tr><td className="py-4 px-4 text-sm text-slate-400 italic text-center">Tidak ada kas masuk.</td></tr>
              ) : pemasukan.map((p, i) => (
                <TableRow key={i} label={p.nama} value={p.jumlah} indent />
              ))}
              <TableRow label="Total Kas Masuk" value={cf.totalMasuk} isTotal />
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-red-200 overflow-hidden">
          <div className="bg-red-700 text-white py-2 px-4 text-sm font-bold">KAS KELUAR (Pengeluaran)</div>
          <table className="w-full">
            <tbody>
              {pengeluaran.length === 0 ? (
                <tr><td className="py-4 px-4 text-sm text-slate-400 italic text-center">Tidak ada kas keluar.</td></tr>
              ) : pengeluaran.map((p, i) => (
                <TableRow key={i} label={p.nama} value={p.jumlah} indent />
              ))}
              <TableRow label="Total Kas Keluar" value={cf.totalKeluar} isTotal />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EquityPanel({ data }: { data: FinancialReportData }) {
  const eq = data.equityStatement;
  const isProfit = eq.labaRugi >= 0;

  return (
    <div>
      <SectionHeader
        title="Laporan Perubahan Ekuitas"
        subtitle={`Statement of Changes in Equity — Periode: ${data.periode}`}
      />
      <div className="max-w-xl">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-violet-700 text-white py-2 px-4 text-sm font-bold">PERUBAHAN EKUITAS PEMILIK</div>
          <table className="w-full">
            <tbody>
              <TableRow label="Modal Awal (Saldo Sebelum Periode)" value={eq.modalAwal} />
              <TableRow label="Tambahan: Total Pendapatan Periode" value={eq.tambahanModal} indent />
              <TableRow
                label={isProfit ? "Laba Bersih Periode" : "Rugi Bersih Periode"}
                value={eq.labaRugi}
                indent
                isNegative={!isProfit}
              />
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-violet-300 bg-violet-50">
                <td className="py-4 px-4 font-bold text-violet-900 text-base">Modal Akhir Periode</td>
                <td className="py-4 px-4 font-bold text-violet-900 text-base text-right">{fmt(eq.modalAkhir)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LaporanPage() {
  const [mode, setMode] = useState<"bulanan" | "tahunan">("bulanan");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<Tab>("trial");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinancialReportData | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        mode,
        tahun: String(tahun),
        bulan: String(bulan),
      });
      const res = await fetch(`/api/financial-report?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setReport(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, bulan, tahun]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={24} className="text-blue-600" />
            Laporan Keuangan
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate laporan keuangan otomatis berdasarkan data transaksi Anda.</p>
        </div>
        {report && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors print:hidden"
          >
            <Download size={16} />
            Ekspor PDF
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 print:hidden">
        <h2 className="text-base font-bold text-slate-700 mb-4">Pilih Periode Laporan</h2>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Mode toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Jenis Periode</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(["bulanan", "tahunan"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 text-sm font-medium transition-colors capitalize ${
                    mode === m
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m === "bulanan" ? "Bulanan" : "Tahunan"}
                </button>
              ))}
            </div>
          </div>

          {/* Bulan — only for monthly */}
          {mode === "bulanan" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bulan</label>
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {BULAN.map((b, i) => (
                  <option key={i} value={i + 1}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tahun */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {TAHUN_LIST.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center ml-2 mb-1.5">
            {loading ? (
              <span className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full">
                <Loader2 size={14} className="animate-spin" /> Memperbarui...
              </span>
            ) : (
              <span className="text-sm text-slate-400">Pilih periode untuk otomatis melihat laporan.</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>

      {/* Report Output */}
      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Report header (shown on print) */}
          <div className="hidden print:block p-8 border-b border-slate-200 text-center">
            <h1 className="text-2xl font-bold text-slate-900">KeuanganKu — Laporan Keuangan</h1>
            <p className="text-slate-600 mt-1">Periode: {report.periode}</p>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-200 print:hidden">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 print:p-8">
            {/* On screen: show active tab. On print: show all */}
            <div className="print:hidden">
              {activeTab === "trial" && <TrialBalance data={report} />}
              {activeTab === "income" && <IncomeStatementPanel data={report} />}
              {activeTab === "balance" && <BalanceSheetPanel data={report} />}
              {activeTab === "cashflow" && <CashFlowPanel data={report} />}
              {activeTab === "equity" && <EquityPanel data={report} />}
            </div>
            {/* Print-only: all tabs */}
            <div className="hidden print:block space-y-16">
              <TrialBalance data={report} />
              <IncomeStatementPanel data={report} />
              <BalanceSheetPanel data={report} />
              <CashFlowPanel data={report} />
              <EquityPanel data={report} />
            </div>
          </div>
        </div>
      )}

      {/* Loading state (initial) */}
      {!report && loading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 size={48} strokeWidth={1.2} className="animate-spin text-blue-500" />
          <p className="text-base font-medium">Memuat laporan keuangan otomatis...</p>
        </div>
      )}
    </div>
  );
}
