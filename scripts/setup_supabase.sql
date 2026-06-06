-- ============================================================
-- KeuanganKu - Supabase Database Setup
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Table: transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tanggal DATE NOT NULL,
  deskripsi TEXT NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('Pemasukan', 'Pengeluaran')),
  jumlah NUMERIC NOT NULL,
  kategori TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Table: budgets
CREATE TABLE IF NOT EXISTS budgets (
  kategori TEXT PRIMARY KEY,
  jumlah NUMERIC NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaksi
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read access on transaksi') THEN
    CREATE POLICY "Allow anonymous read access on transaksi" ON transaksi FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert access on transaksi') THEN
    CREATE POLICY "Allow anonymous insert access on transaksi" ON transaksi FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update access on transaksi') THEN
    CREATE POLICY "Allow anonymous update access on transaksi" ON transaksi FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous delete access on transaksi') THEN
    CREATE POLICY "Allow anonymous delete access on transaksi" ON transaksi FOR DELETE USING (true);
  END IF;

  -- RLS Policies for budgets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read access on budgets') THEN
    CREATE POLICY "Allow anonymous read access on budgets" ON budgets FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert access on budgets') THEN
    CREATE POLICY "Allow anonymous insert access on budgets" ON budgets FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update access on budgets') THEN
    CREATE POLICY "Allow anonymous update access on budgets" ON budgets FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous delete access on budgets') THEN
    CREATE POLICY "Allow anonymous delete access on budgets" ON budgets FOR DELETE USING (true);
  END IF;
END
$$;
