# Asisten Keuangan - Dokumentasi Lengkap

## 📋 Daftar Isi

1. [Tentang Aplikasi](#tentang-aplikasi)
2. [Latar Belakang](#latar-belakang)
3. [Fitur Utama](#fitur-utama)
4. [Tech Stack](#tech-stack)
5. [Arsitektur Sistem](#arsitektur-sistem)
6. [Alur Aplikasi](#alur-aplikasi)
7. [Schema Database](#schema-database)
8. [Setup & Instalasi](#setup--instalasi)
9. [Struktur Folder](#struktur-folder)
10. [API Endpoints](#api-endpoints)

---

## 📖 Tentang Aplikasi

**Asisten Keuangan** adalah aplikasi web modern untuk manajemen keuangan pribadi yang dilengkapi dengan asisten AI cerdas. Aplikasi ini membantu pengguna untuk mencatat, menganalisis, dan mengelola keuangan sehari-hari dengan mudah dan interaktif.

### Visi
Menjadi asisten keuangan pribadi yang mudah diakses, cerdas, dan membantu masyarakat Indonesia mencapai kebebasan finansial.

### Misi
- Menyediakan platform pencatatan keuangan yang user-friendly
- Memberikan insight dan analisis keuangan berbasis AI
- Membantu pengguna membuat keputusan keuangan yang lebih baik

---

## 💡 Latar Belakang

Di era digital saat ini, pengelolaan keuangan pribadi menjadi semakin penting namun seringkali diabaikan. Banyak orang mengalami kesulitan dalam:

1. **Mencatat Transaksi Harian** - Metode konvensional seperti buku catatan atau spreadsheet seringkali ribet dan tidak praktis
2. **Analisis Keuangan** - Sulit untuk mendapatkan insight dari data keuangan yang tercatat
3. **Konsistensi** - Banyak aplikasi keuangan yang kompleks sehingga pengguna cepat bosan
4. **Biaya** - Aplikasi keuangan yang baik seringkali berbayar dengan harga mahal

Asisten Keuangan hadir sebagai solusi dengan:
- ✅ **Input Natural** - Catat transaksi melalui chat seperti berbicara dengan teman
- ✅ **AI-Powered** - Analisis otomatis dan saran keuangan personal
- ✅ **Gratis & Open Source** - Dapat digunakan dan dikembangkan oleh siapa saja
- ✅ **Real-time Dashboard** - Visualisasi data keuangan yang menarik dan informatif

---

## ✨ Fitur Utama

### 1. 🤖 AI Chat Assistant
- **Pencatatan Transaksi Natural** - Cukup ketik "Beli makan siang 50rb" untuk mencatat pengeluaran
- **Intent Recognition** - AI otomatis mendeteksi apakah user ingin mencatat transaksi atau bertanya
- **Saran Keuangan** - Tips dan rekomendasi berdasarkan pola pengeluaran
- **Multi-round Conversation** - Chat berlanjut dengan konteks yang terjaga

### 2. 📊 Dashboard Analitik
- **Summary Cards** - Total saldo, pemasukan, pengeluaran, dan tabungan
- **Grafik Trend** - Visualisasi pemasukan vs pengeluaran per bulan
- **Kategori Pengeluaran** - Pie chart distribusi pengeluaran per kategori
- **Trend Tabungan** - Grafik pertumbuhan tabungan dari waktu ke waktu
- **Riwayat Transaksi** - List transaksi terakhir dengan detail lengkap

### 3. 💰 Manajemen Transaksi
- **Income & Expense** - Pencatatan pemasukan dan pengeluaran terpisah
- **Kategorisasi Otomatis** - AI menentukan kategori transaksi secara otomatis
- **Filter Periode** - Lihat data berdasarkan rentang waktu (1, 3, 6 bulan, 1 tahun)
- **Multi-currency Support** - Format Rupiah Indonesia (Rp)

### 4. 🔐 Keamanan & Autentikasi
- **Clerk Authentication** - Login aman dengan berbagai provider (Google, GitHub, Email, dll)
- **Row Level Security** - Data terisolasi per user di level database
- **JWT Token** - Autentikasi stateless yang aman
- **Session Management** - Manajemen sesi otomatis

### 5. 🎨 User Experience
- **Dark Mode** - Tampilan gelap yang nyaman di mata
- **Responsive Design** - Optimal untuk desktop, tablet, dan mobile
- **Modern UI** - Desain clean dengan gradient dan animasi halus
- **Loading States** - Feedback visual saat loading data
- **Error Handling** - Pesan error yang informatif dan helpful

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React Framework dengan App Router |
| **React** | 19.1.0 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Styling |
| **shadcn/ui** | Latest | UI Components |
| **Recharts** | 2.15.4 | Data Visualization (Charts) |
| **Lucide React** | 0.532.0 | Icons |
| **next-themes** | 0.4.6 | Dark/Light Mode |

### Backend & API
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | - | Server-side API |
| **Clerk** | 6.x | Authentication & User Management |
| **Supabase** | 2.53.0 | Database & Backend-as-a-Service |

### AI & Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| **Groq** | - | AI Inference Platform |
| **Llama 3.3 70B** | - | Large Language Model |
| **AI SDK** | 5.x | AI Integration Library |

### Development Tools
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Turbopack** | Fast Build Tool (Next.js 15) |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (React)                  │ │
│  │  - Dashboard Components                                │ │
│  │  - Chat Interface                                      │ │
│  │  - Charts & Visualizations                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Application Server                 │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   API Routes     │  │   Server Actions │                │
│  │  - /api/chat     │  │   - Data Fetching│                │
│  │  - /api/dashboard│  │   - Mutations    │                │
│  │  - /api/debug    │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│     Clerk        │          │     Supabase     │
│  Authentication  │          │     Database     │
│                  │          │                  │
│ - User Management│          │ - Transactions   │
│ - JWT Tokens     │          │ - Savings        │
│ - Sessions       │          │ - Categories     │
└──────────────────┘          └──────────────────┘
         │
         ▼
┌──────────────────┐
│  Groq AI (LLM)   │
│  Llama 3.3 70B   │
│                  │
│ - Intent Detect  │
│ - NLP Processing │
│ - Response Gen   │
└──────────────────┘
```

---

## 🔄 Alur Aplikasi

### 1. Alur Autentikasi

```
User → Landing Page → Click Login → Clerk Sign In
                           ↓
                    Clerk Dashboard
                           ↓
                    Redirect to /dashboard
                           ↓
                    Create/Get User Session
```

### 2. Alur Pencatatan Transaksi via AI Chat

```
User Input Text → "/api/chat" → AI Intent Detection
                                      ↓
                        ┌─────────────┴─────────────┐
                        │                           │
                  "record_transaction"        "general_chat"
                        │                           │
                        ▼                           ▼
              Extract Data:                Generate Response
              - type (income/expense)           ↓
              - amount                    Return AI Response
              - category
              - description
              - date
                        │
                        ▼
              Save to Supabase
              (transactions table)
                        │
                        ▼
              Generate Confirmation
              + Financial Advice
                        │
                        ▼
              Return to Chat UI
```

### 3. Alur Dashboard Analytics

```
User Opens /dashboard/overview
              ↓
    Fetch Data from /api/dashboard?timeRange=6m
              ↓
    Query Supabase (transactions table)
    - Filter by user_id (Clerk JWT)
    - Filter by date range
    - Order by date DESC
              ↓
    Process Data:
    - Calculate totals (income, expense, balance)
    - Group by month for trends
    - Aggregate by category
    - Format for charts
              ↓
    Return JSON Response
              ↓
    Render Dashboard:
    - Summary Cards
    - Charts (Bar, Pie, Area, Line)
    - Recent Transactions List
```

### 4. Alur Keamanan (RLS - Row Level Security)

```
User Request → Clerk JWT Token → API Route
                                      ↓
                            Extract user_id from JWT
                                      ↓
                            Query Supabase with:
                            WHERE user_id = JWT.sub
                                      ↓
                            Supabase RLS Policy:
                            CHECK (auth.jwt()->>'sub' = user_id)
                                      ↓
                            Return ONLY user's data
```

---

## 🗄️ Schema Database

### Tabel: `transactions`

Tabel utama untuk menyimpan semua transaksi keuangan user.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,              -- Clerk User ID (dari JWT 'sub' claim)
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Lainnya',
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
```

**Field Description:**
- `id` - Unique identifier untuk setiap transaksi
- `user_id` - Clerk user ID (format: `user_xxxxx`) untuk memisahkan data antar user
- `type` - Jenis transaksi: `income` (pemasukan) atau `expense` (pengeluaran)
- `amount` - Jumlah uang dalam Rupiah (maksimal: 999,999,999,999.99)
- `category` - Kategori transaksi (Makanan, Transportasi, Gaji, dll)
- `description` - Deskripsi/detail transaksi
- `date` - Tanggal transaksi
- `created_at` - Waktu transaksi dibuat di sistem
- `updated_at` - Waktu terakhir update

**Kategori Default:**
- **Income:** Gaji, Freelance, Bonus, Investasi, Lainnya
- **Expense:** Makanan, Transportasi, Belanja, Hiburan, Tagihan, Kesehatan, Pendidikan, Lainnya

---

### Tabel: `savings`

Tabel untuk menyimpan target tabungan user.

```sql
CREATE TABLE savings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,                   -- Nama tabungan (contoh: "Dana Darurat")
  target_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  deadline DATE,                        -- Target waktu (opsional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_savings_user_id ON savings(user_id);
```

**Field Description:**
- `name` - Nama/nama target tabungan
- `target_amount` - Jumlah target yang ingin dicapai
- `current_amount` - Jumlah tabungan saat ini
- `deadline` - Batas waktu pencapaian target (opsional)

---

### Tabel: `categories`

Tabel untuk kategori kustom yang dibuat user (opsional).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6b7280',         -- Kode warna hex untuk UI
  icon TEXT,                            -- Nama icon (opsional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
```

---

### Row Level Security (RLS) Policies

Semua tabel menggunakan RLS untuk memastikan user hanya bisa mengakses data mereka sendiri.

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- Savings Policies (sama seperti transactions)
CREATE POLICY "Users can view own savings"
  ON savings FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- ... dan seterusnya untuk INSERT, UPDATE, DELETE

-- Categories Policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- ... dan seterusnya
```

**Catatan:** `auth.jwt() ->> 'sub'` mengambil Clerk user ID dari JWT token yang di-pass melalui Authorization header.

---

## 🚀 Setup & Instalasi

### Prerequisites

- Node.js 18+ dan npm
- Akun [Clerk](https://clerk.com) (gratis)
- Akun [Supabase](https://supabase.com) (gratis)
- Groq API Key (gratis untuk tier tertentu)

### 1. Clone Repository

```bash
git clone <repository-url>
cd Asisten_Keuangan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root folder:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Groq AI
GROQ_API_KEY=gsk_xxxxx
```

### 4. Setup Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy-paste dan jalankan SQL dari file `supabase/migrations/001_create_tables.sql`

### 5. Setup Clerk

1. Buka [Clerk Dashboard](https://dashboard.clerk.com)
2. Buat aplikasi baru atau pilih yang sudah ada
3. Dapatkan **Publishable Key** dan **Secret Key** dari API Keys
4. Setup **Third-Party Auth** untuk integrasi dengan Supabase:
   - Buka Supabase Dashboard → Authentication → Integrations
   - Pilih Clerk dan ikuti panduan setup

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Folder

```
Asisten_Keuangan/
├── .env                          # Environment variables (production)
├── .env.local                    # Environment variables (development)
├── .gitignore
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind CSS config
├── components.json               # shadcn/ui config
├── README.md                     # Quick start guide
├── SUPABASE_SETUP.md            # Supabase setup guide
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # License file
│
├── public/                      # Static assets
│   ├── favicon.ico
│   └── ...
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   ├── chat/
│   │   │   │   └── route.ts    # AI Chat endpoint
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts    # Dashboard data endpoint
│   │   │   └── debug/
│   │   │       └── route.ts    # Debug endpoint
│   │   │
│   │   ├── dashboard/
│   │   │   ├── overview/
│   │   │   │   └── page.tsx   # Dashboard analytics page
│   │   │   └── page.tsx       # Dashboard home (chat focus)
│   │   │
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx   # Sign in page
│   │   │
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx   # Sign up page
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (20+ components)
│   │   │
│   │   ├── chat.tsx           # Chat interface component
│   │   ├── theme-provider.tsx # Dark mode provider
│   │   └── theme-toggle.tsx   # Theme switcher
│   │
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client config
│   │   ├── user.ts            # User utilities
│   │   └── utils.ts           # General utilities (cn function)
│   │
│   └── types/
│       └── database.ts        # TypeScript types/interfaces
│
└── supabase/
    └── migrations/
        └── 001_create_tables.sql   # Database schema
```

---

## 🔌 API Endpoints

### 1. POST `/api/chat`

Endpoint untuk AI chat dan pencatatan transaksi otomatis.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Saya beli makan siang 50 ribu"
    }
  ]
}
```

**Response:**
```json
{
  "text": "Transaksi berhasil dicatat! Pengeluaran Rp 50.000 untuk Makanan...",
  "transaction": {
    "success": true,
    "data": {
      "id": "uuid",
      "type": "expense",
      "amount": 50000,
      "category": "Makanan",
      "description": "Beli makan siang",
      "date": "2026-02-21"
    }
  },
  "intent": {
    "intent": "record_transaction",
    "type": "expense",
    "amount": 50000,
    "category": "Makanan"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (not logged in)
- `500` - Server error

---

### 2. GET `/api/dashboard?timeRange=6m`

Endpoint untuk mengambil data dashboard analytics.

**Query Parameters:**
- `timeRange` - Periode data: `1m`, `3m`, `6m`, `1y` (default: `6m`)

**Response:**
```json
{
  "totalBalance": 5000000,
  "totalIncome": 10000000,
  "totalExpense": 5000000,
  "totalSavings": 2500000,
  "incomeExpenseTrend": [
    { "month": "Jan", "income": 8000000, "expense": 6000000 },
    { "month": "Feb", "income": 9000000, "expense": 7000000 }
  ],
  "categoryBreakdown": [
    { "name": "Makanan", "value": 2500000, "color": "#10b981" },
    { "name": "Transportasi", "value": 1200000, "color": "#3b82f6" }
  ],
  "savingsTrend": [
    { "month": "Jan", "savings": 2000000 },
    { "month": "Feb", "savings": 2500000 }
  ],
  "recentTransactions": [
    {
      "id": "uuid",
      "type": "expense",
      "category": "Makanan",
      "amount": 50000,
      "date": "2026-02-21",
      "description": "Beli makan siang"
    }
  ],
  "_debug": {
    "transactionsCount": 15,
    "hasAnyData": true
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `503` - Supabase not configured

---

### 3. GET `/api/debug`

Endpoint untuk debugging koneksi database.

**Response:**
```json
{
  "success": true,
  "userId": "user_xxxxx",
  "transactionCount": 15,
  "transactions": [...],
  "errors": {
    "fetch": null,
    "count": null
  },
  "hint": {
    "clerkUserId": "user_xxxxx",
    "sampleUserIds": "user_xxxxx"
  }
}
```

---

## 📊 Fitur Mendatang (Roadmap)

### Phase 1 - Completed ✅
- [x] AI Chat dengan intent recognition
- [x] Pencatatan transaksi otomatis
- [x] Dashboard analytics
- [x] Autentikasi Clerk
- [x] Database Supabase dengan RLS

### Phase 2 - In Progress 🚧
- [ ] Export data ke Excel/CSV
- [ ] Budget planning & alerts
- [ ] Multi-currency support
- [ ] Recurring transactions

### Phase 3 - Planned 📅
- [ ] Mobile app (React Native)
- [ ] Bill reminders
- [ ] Investment tracking
- [ ] Financial reports (PDF)
- [ ] Shared expenses (family/couple)
- [ ] Bank integration (auto-import)

---

## 🤝 Kontribusi

Kami terbuka untuk kontribusi! Silakan baca [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan lengkap.

### Cara Kontribusi:
1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

---

## 👥 Tim & Credits

**Developer:**
- Full-stack development oleh tim Asisten Keuangan

**Tech Partners:**
- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database
- [Groq](https://groq.com) - AI Inference
- [Vercel](https://vercel.com) - Hosting Platform

**UI/UX:**
- [shadcn/ui](https://ui.shadcn.com) - Component Library
- [Lucide Icons](https://lucide.dev) - Icons

---

## 📞 Support

Untuk pertanyaan atau bantuan:
- 📧 Email: support@asistenkeuangan.app (contoh)
- 💬 Discord: [link discord]
- 📖 Docs: [link dokumentasi]

---

**Terima kasih telah menggunakan Asisten Keuangan!** 🙏

Mari bersama-sama mencapai kebebasan finansial! 💰📈
