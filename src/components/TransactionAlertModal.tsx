"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, ShieldAlert, Info, Sparkles } from "lucide-react";

export interface AlertData {
  severity: "low" | "medium" | "high";
  message: string;
  transactionName: string;
  amount: number;
}

interface Props {
  alert: AlertData | null;
  onClose: () => void;
}

const SEVERITY_CONFIG = {
  low: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    badgeText: "Perhatian",
    headerText: "text-amber-800",
    Icon: Info,
    progress: "bg-amber-400",
  },
  medium: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    badgeText: "Peringatan",
    headerText: "text-orange-800",
    Icon: AlertTriangle,
    progress: "bg-orange-500",
  },
  high: {
    bg: "bg-red-50",
    border: "border-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    badge: "bg-red-100 text-red-700",
    badgeText: "PERINGATAN KRITIS",
    headerText: "text-red-800",
    Icon: ShieldAlert,
    progress: "bg-red-600",
  },
};

export default function TransactionAlertModal({ alert, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (alert) {
      setExiting(false);
      // Short delay to allow mount before animating in
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [alert]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };

  if (!alert) return null;

  const cfg = SEVERITY_CONFIG[alert.severity];
  const { Icon } = cfg;

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    /* Backdrop */
    <div
      className={`fixed inset-0 z-[9999] flex items-start justify-center pt-6 px-4 transition-all duration-300 ${
        visible && !exiting
          ? "bg-black/40 backdrop-blur-sm"
          : "bg-transparent pointer-events-none"
      }`}
      onClick={handleClose}
    >
      {/* Modal card */}
      <div
        className={`w-full max-w-md rounded-2xl border-2 shadow-2xl transition-all duration-300 ${cfg.bg} ${cfg.border} ${
          visible && !exiting
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Severity progress bar at top */}
        <div className={`h-1.5 rounded-t-2xl ${cfg.progress}`} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
                <Icon size={22} />
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  <Sparkles size={10} />
                  {cfg.badgeText}
                </span>
                <p className={`text-sm font-bold mt-0.5 ${cfg.headerText}`}>
                  Transaksi Tidak Biasa Terdeteksi
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          {/* Transaction summary */}
          <div className="bg-white/70 rounded-xl p-4 mb-4 border border-white/80">
            <p className="text-xs font-medium text-slate-500 mb-1">Transaksi yang dicatat</p>
            <p className="font-semibold text-slate-800 text-sm truncate">{alert.transactionName}</p>
            <p className={`text-xl font-bold mt-1 ${cfg.headerText}`}>
              {formatRupiah(alert.amount)}
            </p>
          </div>

          {/* AI message */}
          <div className="flex gap-2.5">
            <Sparkles size={15} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-700 leading-relaxed">{alert.message}</p>
          </div>

          {/* Action button */}
          <button
            onClick={handleClose}
            className={`mt-5 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 ${
              alert.severity === "high"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : alert.severity === "medium"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            Mengerti, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
