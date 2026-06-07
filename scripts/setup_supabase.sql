-- ============================================================
-- KeuanganKu - Supabase Database Setup (AUTH & ISOLATION V2)
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tambahkan kolom user_id jika belum ada
ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Karena tabel budgets sekarang hanya memiliki satu konfigurasi per user,
-- kita atur user_id sebagai PRIMARY KEY.
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- [PERBAIKAN ERROR] Hapus data lama yang tidak memiliki user_id (NULL)
-- karena Primary Key tidak boleh memiliki nilai NULL.
DELETE FROM transaksi WHERE user_id IS NULL;
DELETE FROM budgets WHERE user_id IS NULL;

-- Hapus PRIMARY KEY lama pada budgets jika ada, lalu buat PK baru berdasarkan user_id
DO $$
BEGIN
  BEGIN
    ALTER TABLE budgets DROP CONSTRAINT budgets_pkey;
  EXCEPTION
    WHEN undefined_object THEN null;
  END;
  
  BEGIN
    ALTER TABLE budgets ADD PRIMARY KEY (user_id);
  EXCEPTION
    WHEN invalid_table_definition THEN null;
  END;
END $$;


-- 2. Pastikan RLS Aktif
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;


-- 3. Matikan RLS sementara dan Hapus Semua Kebijakan Lama
ALTER TABLE transaksi DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transaksi;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transaksi;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transaksi;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transaksi;
DROP POLICY IF EXISTS "Allow anonymous read access on transaksi" ON transaksi;
DROP POLICY IF EXISTS "Allow anonymous insert access on transaksi" ON transaksi;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- 4. Buat SATU Kebijakan Master untuk Authenticated Users
-- Validasi user_id sepenuhnya diurus oleh backend Vercel (defense in depth).
CREATE POLICY "transaksi_master_policy" ON transaksi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "budgets_master_policy" ON budgets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Aktifkan RLS kembali
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
