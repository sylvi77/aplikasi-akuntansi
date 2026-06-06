"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, ShieldAlert, Info, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { translations } from "@/lib/translations";

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

export default function TransactionAlertModal({ alert, onClose }: Props) {
  const { language } = useSettings();
  const t = translations[language];
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const SEVERITY_CONFIG = {
    low: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-300 dark:border-amber-600",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
      badgeText: language === "en" ? "Notice" : language === "zh" ? "注意" : language === "ar" ? "ملاحظة" : language === "pt" ? "Aviso" : language === "es" ? "Aviso" : "Perhatian",
      headerText: "text-amber-800 dark:text-amber-300",
      Icon: Info,
      progress: "bg-amber-400",
    },
    medium: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-400 dark:border-orange-600",
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
      badgeText: language === "en" ? "Warning" : language === "zh" ? "警告" : language === "ar" ? "تحذير" : language === "pt" ? "Aviso" : language === "es" ? "Advertencia" : "Peringatan",
      headerText: "text-orange-800 dark:text-orange-300",
      Icon: AlertTriangle,
      progress: "bg-orange-500",
    },
    high: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-500 dark:border-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
      badgeText: language === "en" ? "CRITICAL WARNING" : language === "zh" ? "严重警告" : language === "ar" ? "تحذير خطير" : language === "pt" ? "AVISO CRÍTICO" : language === "es" ? "ADVERTENCIA CRÍTICA" : "PERINGATAN KRITIS",
      headerText: "text-red-800 dark:text-red-300",
      Icon: ShieldAlert,
      progress: "bg-red-600",
    },
  };

  useEffect(() => {
    if (alert) {
      setExiting(false);
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
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

  const detectedLabel =
    language === "en" ? "Unusual Transaction Detected"
    : language === "zh" ? "检测到异常交易"
    : language === "ar" ? "تم اكتشاف معاملة غير عادية"
    : language === "pt" ? "Transação Incomum Detectada"
    : language === "es" ? "Transacción Inusual Detectada"
    : "Transaksi Tidak Biasa Terdeteksi";

  const recordedLabel =
    language === "en" ? "Recorded transaction"
    : language === "zh" ? "记录的交易"
    : language === "ar" ? "المعاملة المسجلة"
    : language === "pt" ? "Transação registrada"
    : language === "es" ? "Transacción registrada"
    : "Transaksi yang dicatat";

  const continueLabel =
    language === "en" ? "Understood, Continue"
    : language === "zh" ? "明白，继续"
    : language === "ar" ? "مفهوم، استمرار"
    : language === "pt" ? "Entendido, Continuar"
    : language === "es" ? "Entendido, Continuar"
    : "Mengerti, Lanjutkan";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-start justify-center pt-6 px-4 transition-all duration-300 ${
        visible && !exiting
          ? "bg-black/40 backdrop-blur-sm"
          : "bg-transparent pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border-2 shadow-2xl transition-all duration-300 ${cfg.bg} ${cfg.border} ${
          visible && !exiting
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Severity progress bar */}
        <div className={`h-1.5 rounded-t-2xl ${cfg.progress}`} />

        <div className="p-5">
          {/* Header */}
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
                  {detectedLabel}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Transaction summary */}
          <div className="bg-white/70 dark:bg-white/10 rounded-xl p-4 mb-4 border border-white/80 dark:border-white/20">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{recordedLabel}</p>
            <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{alert.transactionName}</p>
            <p className={`text-xl font-bold mt-1 ${cfg.headerText}`}>
              {formatRupiah(alert.amount)}
            </p>
          </div>

          {/* AI message */}
          <div className="flex gap-2.5">
            <Sparkles size={15} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{alert.message}</p>
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
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
