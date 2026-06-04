"use client";

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Transaction {
  tanggal: string;
  tipe: string;
  jumlah: number;
}

export default function DashboardCharts({ data }: { data: Transaction[] }) {
  // Memoised so the 7-day aggregation only reruns when `data` changes
  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];

      const dayTx = data.filter(t => t.tanggal === dateStr);
      return {
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        Pemasukan: dayTx.filter(t => t.tipe === 'Pemasukan').reduce((s, t) => s + t.jumlah, 0),
        Pengeluaran: dayTx.filter(t => t.tipe === 'Pengeluaran').reduce((s, t) => s + t.jumlah, 0),
      };
    });
  }, [data]);

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `Rp${v / 1000}k`}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number'
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
                : value
            }
            cursor={{ fill: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

