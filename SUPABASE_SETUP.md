# Setup Database Supabase untuk Asisten Keuangan

File ini berisi panduan lengkap untuk menyiapkan database Supabase agar dashboard keuangan dapat menampilkan data real.

## Langkah 1: Buka Supabase Dashboard

1. Login ke [Supabase](https://supabase.com)
2. Pilih project Anda atau buat project baru
3. Masuk ke **SQL Editor** di sidebar kiri

## Langkah 2: Jalankan SQL Migration

1. Copy isi file `supabase/migrations/001_create_tables.sql`
2. Paste ke SQL Editor di Supabase
3. Klik **Run** untuk mengeksekusi

SQL ini akan membuat:
- ✅ Tabel `transactions` - untuk menyimpan semua transaksi pemasukan dan pengeluaran
- ✅ Tabel `savings` - untuk menyimpan target tabungan
- ✅ Tabel `categories` - untuk kategori kustom (opsional)
- ✅ Index untuk performa query yang cepat
- ✅ Row Level Security (RLS) policies untuk keamanan data
- ✅ Trigger untuk auto-update `updated_at`

## Langkah 3: Verifikasi Tabel

Setelah menjalankan SQL, verifikasi di:
1. Masuk ke **Table Editor** di Supabase
2. Anda harus melihat 3 tabel: `transactions`, `savings`, `categories`

## Langkah 4: Tambahkan Data Sample (Opsional)

Untuk testing, Anda bisa menambahkan data sample. Buka SQL Editor dan jalankan:

```sql
-- Ganti 'YOUR_CLERK_USER_ID' dengan Clerk user ID Anda
-- Anda bisa mendapatkan ini setelah login di aplikasi

INSERT INTO transactions (user_id, type, amount, category, description, date)
VALUES 
  ('YOUR_CLERK_USER_ID', 'income', 8000000, 'Gaji', 'Gaji bulanan Februari', '2026-02-01'),
  ('YOUR_CLERK_USER_ID', 'expense', 1500000, 'Makanan', 'Belanja makanan bulanan', '2026-02-05'),
  ('YOUR_CLERK_USER_ID', 'expense', 500000, 'Transportasi', 'Bensin dan parkir', '2026-02-10'),
  ('YOUR_CLERK_USER_ID', 'expense', 800000, 'Tagihan', 'Listrik, air, dan internet', '2026-02-15'),
  ('YOUR_CLERK_USER_ID', 'income', 1500000, 'Freelance', 'Project desain website', '2026-02-18'),
  ('YOUR_CLERK_USER_ID', 'expense', 300000, 'Hiburan', 'Nonton bioskop dan makan luar', '2026-02-20'),
  ('YOUR_CLERK_USER_ID', 'expense', 2000000, 'Belanja', 'Beli laptop bekas', '2026-02-22');

INSERT INTO savings (user_id, name, target_amount, current_amount, deadline)
VALUES 
  ('YOUR_CLERK_USER_ID', 'Dana Darurat', 10000000, 3500000, '2026-12-31'),
  ('YOUR_CLERK_USER_ID', 'Liburan Bali', 5000000, 1200000, '2026-08-31');
```

## Langkah 5: Dapatkan Clerk User ID Anda

Untuk mengetahui Clerk user ID Anda:

1. Login ke aplikasi Asisten Keuangan
2. Buka dashboard
3. Buka browser DevTools (F12)
4. Masuk ke tab **Network**
5. Refresh halaman
6. Cari request ke `/api/dashboard`
7. Lihat response - jika ada error "Unauthorized", artinya Anda perlu login dulu
8. Setelah login, user ID Anda adalah nilai `sub` dari JWT token Clerk

Atau cara lain:
1. Buka [Clerk Dashboard](https://dashboard.clerk.com)
2. Pilih aplikasi Anda
3. Masuk ke **Users**
4. Klik user Anda
5. User ID ada di URL atau di bagian user details (format: `user_xxxxx`)

## Struktur Tabel

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Clerk user ID |
| type | TEXT | 'income' atau 'expense' |
| amount | DECIMAL | Jumlah uang |
| category | TEXT | Kategori (Makanan, Transportasi, dll) |
| description | TEXT | Deskripsi transaksi |
| date | DATE | Tanggal transaksi |
| created_at | TIMESTAMPTZ | Waktu pembuatan |
| updated_at | TIMESTAMPTZ | Waktu update terakhir |

### savings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Clerk user ID |
| name | TEXT | Nama tabungan |
| target_amount | DECIMAL | Target jumlah |
| current_amount | DECIMAL | Jumlah saat ini |
| deadline | DATE | Batas waktu (opsional) |
| created_at | TIMESTAMPTZ | Waktu pembuatan |
| updated_at | TIMESTAMPTZ | Waktu update terakhir |

### categories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Clerk user ID |
| name | TEXT | Nama kategori |
| type | TEXT | 'income' atau 'expense' |
| color | TEXT | Kode warna hex (opsional) |
| icon | TEXT | Nama icon (opsional) |
| created_at | TIMESTAMPTZ | Waktu pembuatan |

## Keamanan: Row Level Security (RLS)

Semua tabel sudah dilengkapi RLS policies yang memastikan:
- ✅ User hanya bisa melihat data mereka sendiri
- ✅ User hanya bisa menambah/edit/hapus data mereka sendiri
- ✅ User tidak bisa mengakses data user lain

RLS menggunakan JWT token dari Clerk yang secara otomatis disertakan dalam setiap request.

## Environment Variables

Pastikan file `.env.local` Anda sudah berisi:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing

Setelah setup selesai:

1. Restart development server: `npm run dev`
2. Login ke aplikasi
3. Buka `/dashboard/overview`
4. Dashboard akan menampilkan data real dari Supabase

## Troubleshooting

### Error: "Supabase not configured"
- Pastikan environment variables sudah diset di `.env.local`
- Restart server setelah mengubah `.env.local`

### Error: "Unauthorized"
- Pastikan Anda sudah login
- Cek apakah Clerk user ID sudah benar di database

### Data tidak muncul
- Cek di Supabase Table Editor apakah data sudah ada
- Pastikan `user_id` di database sama dengan Clerk user ID Anda
- Cek browser console untuk error

### RLS Policy Error
- Pastikan Third-Party Auth Clerk sudah dikonfigurasi di Supabase
- Lihat file `SUPABASE_CLERK_SETUP.md` untuk panduan lengkap

## Kategori Default

Aplikasi menggunakan kategori default berikut untuk pengeluaran:
- Makanan (hijau: #10b981)
- Transportasi (biru: #3b82f6)
- Belanja (kuning: #f59e0b)
- Hiburan (merah: #ef4444)
- Tagihan (ungu: #8b5cf6)
- Kesehatan (pink: #ec4899)
- Pendidikan (cyan: #06b6d4)
- Lainnya (abu-abu: #6b7280)

Anda bisa menambahkan kategori kustom melalui tabel `categories`.
