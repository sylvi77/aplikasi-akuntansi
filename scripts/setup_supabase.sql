-- ============================================================
-- KeuanganKu - Supabase Database Setup (AUTH & ISOLATION V2)
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tambahkan kolom user_id jika belum ada
ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Karena tabel budgets memiliki kategori sebagai PRIMARY KEY sebelumnya,
-- kita harus ubah agar PRIMARY KEY adalah kombinasi (kategori, user_id).
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Hapus PRIMARY KEY lama pada budgets jika ada, lalu buat kombinasi PK baru
DO $$
BEGIN
  BEGIN
    ALTER TABLE budgets DROP CONSTRAINT budgets_pkey;
  EXCEPTION
    WHEN undefined_object THEN null;
  END;
  
  BEGIN
    ALTER TABLE budgets ADD PRIMARY KEY (kategori, user_id);
  EXCEPTION
    WHEN invalid_table_definition THEN null;
  END;
END $$;


-- 2. Pastikan RLS Aktif
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;


-- 3. Hapus Kebijakan Lama (yang menggunakan USING (true))
DROP POLICY IF EXISTS "Allow anonymous read access on transaksi" ON transaksi;
DROP POLICY IF EXISTS "Allow anonymous insert access on transaksi" ON transaksi;
DROP POLICY IF EXISTS "Allow anonymous update access on transaksi" ON transaksi;
DROP POLICY IF EXISTS "Allow anonymous delete access on transaksi" ON transaksi;

DROP POLICY IF EXISTS "Allow anonymous read access on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow anonymous insert access on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow anonymous update access on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow anonymous delete access on budgets" ON budgets;


-- 4. Buat Kebijakan Baru (ISOLASI DATA PER USER)
-- Transaksi Policies
CREATE POLICY "Users can view their own transactions" 
ON transaksi FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON transaksi FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON transaksi FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON transaksi FOR DELETE 
USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets" 
ON budgets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" 
ON budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON budgets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON budgets FOR DELETE 
USING (auth.uid() = user_id);
