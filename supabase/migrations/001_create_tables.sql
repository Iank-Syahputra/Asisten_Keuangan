-- ============================================
-- ASISTEN KEUANGAN - SUPABASE TABLES SETUP
-- ============================================
-- File ini berisi SQL untuk membuat tabel yang diperlukan
-- untuk aplikasi Asisten Keuangan dengan integrasi Clerk
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABEL TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID (sub dari JWT)
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Lainnya',
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);

-- ============================================
-- 2. TABEL SAVINGS (Tabungan)
-- ============================================
CREATE TABLE IF NOT EXISTS savings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings(user_id);

-- ============================================
-- 3. TABEL CATEGORIES (Opsional - untuk kustomisasi)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6b7280',
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- ============================================
-- TRIGGER UNTUK UPDATED_AT
-- ============================================

-- Function untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk savings
DROP TRIGGER IF EXISTS update_savings_updated_at ON savings;
CREATE TRIGGER update_savings_updated_at
  BEFORE UPDATE ON savings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS untuk semua tabel
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES UNTUK TRANSACTIONS
-- ============================================

-- Users dapat melihat transaksi mereka sendiri
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- Users dapat menambah transaksi mereka sendiri
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Users dapat update transaksi mereka sendiri
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

-- Users dapat hapus transaksi mereka sendiri
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- ============================================
-- RLS POLICIES UNTUK SAVINGS
-- ============================================

-- Users dapat melihat tabungan mereka sendiri
DROP POLICY IF EXISTS "Users can view own savings" ON savings;
CREATE POLICY "Users can view own savings"
  ON savings
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- Users dapat menambah tabungan mereka sendiri
DROP POLICY IF EXISTS "Users can insert own savings" ON savings;
CREATE POLICY "Users can insert own savings"
  ON savings
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Users dapat update tabungan mereka sendiri
DROP POLICY IF EXISTS "Users can update own savings" ON savings;
CREATE POLICY "Users can update own savings"
  ON savings
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

-- Users dapat hapus tabungan mereka sendiri
DROP POLICY IF EXISTS "Users can delete own savings" ON savings;
CREATE POLICY "Users can delete own savings"
  ON savings
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- ============================================
-- RLS POLICIES UNTUK CATEGORIES
-- ============================================

-- Users dapat melihat kategori mereka sendiri
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
  ON categories
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- Users dapat menambah kategori mereka sendiri
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Users dapat hapus kategori mereka sendiri
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- ============================================
-- SAMPLE DATA (Opsional - untuk testing)
-- ============================================
-- Uncomment baris di bawah untuk insert sample data
-- Ganti 'your-clerk-user-id' dengan Clerk user ID Anda

-- INSERT INTO transactions (user_id, type, amount, category, description, date)
-- VALUES 
--   ('your-clerk-user-id', 'income', 5000000, 'Gaji', 'Gaji bulanan', '2026-02-01'),
--   ('your-clerk-user-id', 'expense', 1500000, 'Makanan', 'Belanja makanan bulanan', '2026-02-05'),
--   ('your-clerk-user-id', 'expense', 500000, 'Transportasi', 'Bensin dan parkir', '2026-02-10'),
--   ('your-clerk-user-id', 'expense', 800000, 'Tagihan', 'Listrik dan air', '2026-02-15'),
--   ('your-clerk-user-id', 'income', 1000000, 'Freelance', 'Project desain', '2026-02-18'),
--   ('your-clerk-user-id', 'expense', 300000, 'Hiburan', 'Nonton dan makan luar', '2026-02-20');

-- INSERT INTO savings (user_id, name, target_amount, current_amount, deadline)
-- VALUES 
--   ('your-clerk-user-id', 'Dana Darurat', 10000000, 2500000, '2026-12-31'),
--   ('your-clerk-user-id', 'Liburan', 5000000, 1000000, '2026-08-31');

-- ============================================
-- SELESAI
-- ============================================
