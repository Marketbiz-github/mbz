# PRD — MarketBiz Client Reporting Dashboard

> **Versi:** 1.1  
> **Tanggal:** 2026-06-27  
> **Author:** MarketBiz Engineering  
> **Status:** Draft — Updated with stakeholder feedback

---

## 1. Ringkasan Produk

MarketBiz Dashboard adalah platform pelaporan real-time berbasis web yang digunakan oleh **MarketBiz** (digital agency) untuk memberikan laporan performa layanan kepada klien. Setiap klien diberikan akun untuk mengakses dashboard sesuai dengan layanan yang diambil.

### Layanan MarketBiz

| # | Service ID | Nama Layanan | Deskripsi |
|---|-----------|-------------|-----------|
| 1 | `sosmed` | **Sosmed** | Manajemen & pelaporan social media (Instagram, TikTok, LinkedIn, Facebook) |
| 2 | `email_blast` | **Email Blast** | Blast email massal & pelacakan performa campaign email |
| 3 | `seo` | **SEO** | Optimasi mesin pencari & pelacakan traffic web |
| 4 | `web_dev` | **Web Development** | Pengembangan website & aplikasi web |
| 5 | `wa_blast` | **WA Blast** | Blast WhatsApp massal & pelacakan pengiriman |

---

## 2. User Roles

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **Admin** | Tim MarketBiz (internal) | Full access: kelola client, input laporan, generate akun, kelola semua service, download laporan (PDF/Excel) |
| **Client** | Klien MarketBiz | Read-only dashboard sesuai service yang diambil. Download laporan (PDF/Excel). Menerima notifikasi update |

---

## 3. Alur Utama Sistem

```
┌──────────────────────────────────────────────────────────────────┐
│                        ADMIN WORKFLOW                            │
│                                                                  │
│  1. Admin menambahkan Client baru (nama, email, industry, dll)   │
│     + pilih Service yang diambil                                 │
│                          ↓                                       │
│  2. Sistem auto-generate akun Client menggunakan EMAIL CLIENT    │
│     yang sudah diinput + auto-generate password                  │
│                          ↓                                       │
│  3. Admin membuat Project dalam Service untuk Client tsb          │
│                          ↓                                       │
│  4. Admin menginput data laporan per Project                     │
│                          ↓                                       │
│  5. Admin memberikan credentials akun ke Client                  │
│                          ↓                                       │
│  6. Client login → melihat dashboard → download laporan          │
│                          ↓                                       │
│  7. Client menerima notifikasi di dashboard saat ada update baru │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Navigasi Sidebar (Admin)

| Icon | Label | Route | Deskripsi |
|------|-------|-------|-----------|
| 📊 | **Sosmed** | `/dashboard` | Dashboard laporan sosial media per client/project |
| 📧 | **Email Blast** | `/email` | Manajemen & laporan campaign email blast |
| 💬 | **WA Blast** | `/wa-blast` | Manajemen & laporan WhatsApp blast |
| 🔍 | **SEO** | `/seo` | Dashboard SEO & traffic analytics |
| 👥 | **Client** | `/client` | Manajemen data klien, service, dan project |
| ⚙️ | **System Settings** | `/settings` | Konfigurasi API, tim, branding |

> **Menu yang dihapus/diubah:**
> - ~~KPI Dashboard~~ → **Sosmed**
> - ~~Email Platform~~ → **Email Blast**
> - ~~CRM Clients~~ → **Client** (Route diubah dari `/crm` menjadi `/client`)
> - ~~Social Scheduler~~ → dihapus dari sidebar
> - ~~AI Copy Gen~~ → dihapus dari sidebar
> - **SEO** → **BARU** — ditambahkan sebagai menu utama
> - **WA Blast** → **BARU** — ditambahkan sebagai menu utama (terpisah dari Email Blast)

---

## 5. Hierarki Data

```
Service (Sosmed / Email Blast / WA Blast / SEO / Web Dev)
  └── Client (1 client bisa ambil > 1 service)
        └── Project (1 client per service bisa punya > 1 project)
              └── Report Data (detail metrik per project)
```

### Contoh Kasus

```
Client: PT Sinar Jaya
├── Service: Sosmed
│   ├── Project: "IG Brand Awareness Q3"
│   │   └── Metrik: reach, impression, jumlah postingan, konten produksi
│   └── Project: "TikTok Growth Campaign"
│       └── Metrik: reach, impression, jumlah postingan, konten produksi
├── Service: Email Blast
│   ├── Project: "Newsletter Mingguan"
│   │   └── Metrik: email terkirim, open rate, bounce, block, klik, reply
│   └── Project: "Promo Ramadhan Blast"
│       └── Metrik: email terkirim, open rate, bounce, block, klik, reply
├── Service: WA Blast
│   └── Project: "WA Promo Lebaran"
│       └── Metrik: WA terkirim, delivered, read, replied, failed
├── Service: SEO
│   └── Project: "Optimasi Landing Page"
│       └── Metrik: traffic web, keyword ranking, page views, sessions
└── Service: Web Dev
    └── Project: "Company Profile Website"
        └── Metrik: milestones, progress %, deliverables, status
```

---

## 6. Metrik Per Service

### 6.1 Sosmed

Metrik yang ditrack per **project** (campaign/periode):

| Metrik | Tipe | Deskripsi |
|--------|------|-----------|
| `reach` | integer | Jumlah akun unik yang melihat konten |
| `impressions` | integer | Total tampilan konten (termasuk ulang) |
| `total_posts` | integer | Jumlah postingan yang di-publish |
| `content_produced` | integer | Jumlah konten yang diproduksi (foto/video/grafis) |
| `engagement` | integer | Total interaksi (likes, comments, shares) |
| `followers_gained` | integer | Pertambahan followers |
| `platform` | enum | Platform: `instagram`, `tiktok`, `linkedin`, `facebook` |

**Catatan:** Data diinput manual oleh Admin per log entry (tanggal).

---

### 6.2 Email Blast

Metrik yang ditrack per **campaign** (1 project bisa punya banyak campaign):

| Metrik | Tipe | Deskripsi |
|--------|------|-----------|
| `recipients` | integer | Jumlah email terkirim |
| `opens` | integer | Jumlah email dibuka |
| `open_rate` | computed | `(opens / recipients) × 100%` |
| `bounces` | integer | Jumlah email bounce (gagal kirim) |
| `bounce_rate` | computed | `(bounces / recipients) × 100%` |
| `blocks` | integer | Jumlah email diblokir |
| `clicks` | integer | Jumlah klik link dalam email |
| `replies` | integer | Jumlah reply dari penerima |
| `unsubscribes` | integer | Jumlah unsubscribe |
| `opens_excl_apple` | integer | Opens tanpa Apple Mail Privacy Protection |

**Catatan:** Data diinput manual oleh Admin. Sudah ada tabel `email_campaigns` di database. WA blast **tidak** termasuk di sini (service terpisah).

---

### 6.3 SEO

Metrik yang ditrack per **project**:

| Metrik | Tipe | Sumber | Deskripsi |
|--------|------|--------|-----------|
| `sessions` | integer | GA4 API / Manual | Jumlah sesi web |
| `page_views` | integer | GA4 API / Manual | Total page views |
| `users` | integer | GA4 API / Manual | Jumlah unique users |
| `bounce_rate` | float | GA4 API / Manual | Bounce rate web |
| `avg_session_duration` | float | GA4 API / Manual | Rata-rata durasi sesi (detik) |
| `organic_traffic` | integer | GA4 API / Manual | Traffic dari organic search |
| `top_keywords` | jsonb | Manual / GSC API | Keyword ranking & posisi |
| `top_pages` | jsonb | GA4 API / Manual | Halaman dengan traffic tertinggi |

#### Google Analytics 4 (GA4) Data API — Integrasi

> ✅ **Google Analytics Data API v1 GRATIS** untuk digunakan, hanya ada batasan quota (request per jam/hari per property).
> 
> **Fitur yang bisa dipakai:**
> - **Realtime Report API**: Data up-to-the-minute (active users, pageviews real-time)
> - **Core Report API**: Data historis (sessions, users, pageviews, bounce rate, etc.)
> - **Quota**: Per-property basis, cukup untuk kebutuhan agency (beberapa client)
>
> **Syarat:**
> - Setiap client yang ambil service SEO harus share akses Google Analytics property-nya
> - Admin menyimpan `GA4 Property ID` per project SEO
> - Sistem menggunakan Google Cloud Service Account untuk autentikasi
>
> **Fallback**: Jika client tidak punya GA / belum setup, Admin input data manual

**Implementasi SEO Dashboard:**
1. **Fase 1**: Manual input metrik SEO oleh Admin (seperti email blast)
2. **Fase 2**: Integrasi Google Analytics Data API v1 untuk auto-fetch data
3. **Fase 2+**: Integrasi Google Search Console API untuk keyword data

---

### 6.4 WA Blast — **SERVICE BARU**

Metrik yang ditrack per **campaign** WA (1 project bisa punya banyak campaign):

| Metrik | Tipe | Sumber | Deskripsi |
|--------|------|--------|-----------|
| `total_sent` | integer | Manual | Jumlah WA terkirim |
| `delivered` | integer | Manual | Jumlah WA berhasil delivered |
| `read` | integer | Manual | Jumlah WA yang dibaca |
| `replied` | integer | Manual | Jumlah WA yang dibalas |
| `clicks` | integer | GA4 API / Manual | Jumlah klik link ke website (jika memakai UTM) |
| `failed` | integer | Manual | Jumlah WA gagal kirim |
| `delivery_rate` | computed | Computed | `(delivered / total_sent) × 100%` |
| `read_rate` | computed | Computed | `(read / delivered) × 100%` |
| `click_through_rate` | computed | Computed | `(clicks / delivered) × 100%` (CTR) |
| `campaign_name` | text | Manual | Nama campaign WA |
| `sent_at` | timestamp | Manual | Waktu blast dikirim |
| `template_name` | text | Manual | Nama template WA yang digunakan |

#### Shared GA4 Analytics Architecture
Sistem menggunakan satu backend koneksi Google Analytics 4 (GA4) Property ID yang di-setup di level Client/Project. Data GA4 disaring berdasarkan parameter untuk didistribusikan ke masing-masing dashboard layanan:
1. **SEO Dashboard**: Mengambil total traffic dan memfilternya dengan kriteria `sessionDefaultChannelGrouping = 'Organic Search'` untuk memfokuskan metrik pada performa SEO organik.
2. **WA Blast Dashboard**: Mengambil data traffic (visits/sessions/clicks) yang difilter dengan kriteria `sessionSource = 'whatsapp'` atau parameter UTM yang digunakan pada blast WA.
3. **Email Blast Dashboard**: Mengambil data traffic yang difilter dengan kriteria `sessionSource = 'email'` atau `sessionMedium = 'email'`.

**Catatan:** Data dasar WA Blast (sent/delivered/read) diinput manual oleh Admin (atau via webhook pihak ketiga kelak). Clicks ditrack otomatis jika integrasi GA4 aktif dan menggunakan tautan ber-UTM (misal: `?utm_source=whatsapp&utm_medium=blast&utm_campaign=nama_campaign`).

---

### 6.5 Web Development

Metrik yang ditrack per **project**:

| Metrik | Tipe | Deskripsi |
|--------|------|-----------|
| `milestones` | jsonb | Daftar milestone project (Planning, Design, Development, Testing, Launch) |
| `progress_percentage` | integer | Persentase progress keseluruhan (0-100) |
| `deliverables` | jsonb | Daftar file deliverable yang bisa di-download client |
| `status` | enum | `planning`, `in_progress`, `review`, `completed`, `on_hold` |
| `notes` | text | Catatan update terbaru |

**Catatan:** Service Web Development bersifat project-based tracking, bukan metrik numerik. Hanya **satu arah dari Admin** — Admin input milestone, progress, dan upload deliverables. Client hanya bisa melihat progress dan download deliverables.

---

## 7. Data Model (Database Schema)

### Tabel Eksisting (sudah ada)

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | User profiles (id, role: admin/client) |
| `clients` | Data klien (id, name, industry, owner_id → profiles) |
| `services` | Master services (id, name, description) |
| `client_services` | Junction: client ↔ service (many-to-many) |
| `campaigns` | Campaign sosmed (client_id, platform, status) |
| `performance_logs` | Log performa sosmed (campaign_id, reach, engagement, impressions, clicks) |
| `email_campaigns` | Campaign email blast (client_id, recipients, opens, clicks, bounces, blocks, replies) |
| `contacts` | Kontak per client |

### Tabel Baru yang Dibutuhkan

#### `projects`
```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `sosmed_reports` (menggantikan/extend campaigns + performance_logs)
```sql
CREATE TABLE public.sosmed_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  content_produced INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `email_blast_reports` (extend email_campaigns ke per-project)
```sql
CREATE TABLE public.email_blast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  sender TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  utcid TEXT,
  status TEXT DEFAULT 'completed',
  recipients INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  opens_excl_apple INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `wa_blast_reports`
```sql
CREATE TABLE public.wa_blast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  template_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'completed',
  total_sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  read INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0, -- Click track via Google Analytics integration
  failed INTEGER DEFAULT 0,
  notes TEXT,
  ga_property_id TEXT, -- Google Analytics Property ID (shared with SEO if any)
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ga4_api')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `seo_reports`
```sql
CREATE TABLE public.seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  avg_session_duration NUMERIC(10,2) DEFAULT 0,
  organic_traffic INTEGER DEFAULT 0,
  top_keywords JSONB DEFAULT '[]',
  top_pages JSONB DEFAULT '[]',
  ga_property_id TEXT, -- Google Analytics Property ID (for API integration)
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ga4_api')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `webdev_reports`
```sql
CREATE TABLE public.webdev_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `notifications`
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'report_update', 'new_project', 'system')),
  is_read BOOLEAN DEFAULT false,
  link TEXT, -- optional deep link ke halaman terkait
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Entity Relationship Diagram

```
profiles (user)
    │
    ├──1:N──► clients (via owner_id)
    │              │
    │              ├──M:N──► services (via client_services)
    │              │
    │              ├──1:N──► notifications
    │              │
    │              └──1:N──► projects
    │                           │
    │                           ├──1:N──► sosmed_reports
    │                           ├──1:N──► email_blast_reports
    │                           ├──1:N──► wa_blast_reports
    │                           ├──1:N──► seo_reports
    │                           └──1:N──► webdev_reports
    │
    └── (legacy) campaigns ──► performance_logs
                  email_campaigns
```

---

## 8. Fitur per Halaman

### 8.1 Sosmed (`/dashboard`)

**Admin View:**
1. List semua client → pilih client → pilih project
2. Per project: lihat metrik sosmed (reach, impression, postingan, konten, engagement)
3. Filter by platform (Instagram, TikTok, LinkedIn, Facebook)
4. Chart trend harian/mingguan
5. CRUD report data (tambah, edit, hapus log metrik)
6. Tombol "MANAGE CLIENTS" → redirect ke `/client`

**Client View:**
1. Otomatis terfilter ke project miliknya
2. Lihat metrik read-only
3. Chart trend
4. Download laporan (PDF/Excel)

---

### 8.2 Email Blast (`/email`)

**Admin View:**
1. List semua client → filter by client
2. Per project: lihat semua campaign email
3. CRUD campaign report
4. Aggregate stats: total sent, avg open rate, avg click rate
5. Pagination, search, filter

**Client View:**
1. Lihat campaign report per project miliknya
2. Metrik: recipients, opens, clicks, bounces, blocks, replies
3. Chart activity
4. Download laporan

---

### 8.3 SEO (`/seo`) — **HALAMAN BARU**

**Admin View:**
1. List semua client yang punya service SEO
2. Per project: input metrik SEO manual atau connect GA4
3. Dashboard: sessions, page views, users, bounce rate, organic traffic
4. Top keywords table
5. Top pages table
6. Opsi: input GA4 Property ID → auto-fetch dari Google Analytics API

**Client View:**
1. Dashboard SEO read-only
2. Chart traffic trend
3. Tabel keyword ranking
4. Download laporan

---

### 8.4 WA Blast (`/wa-blast`) — **HALAMAN BARU**

**Admin View:**
1. List semua client yang punya service WA Blast
2. Per project: lihat semua campaign WA
3. CRUD campaign report (tambah, edit, hapus)
4. Aggregate stats: total WA sent, delivery rate, read rate, clicks
5. Pagination, search, filter by client

**Client View:**
1. Lihat campaign WA per project miliknya
2. Metrik: total sent, delivered, read, replied, clicks, failed
3. Chart delivery & click performance
4. Download laporan (PDF/Excel)

---

### 8.5 Client (`/client`)

**Admin View:**
1. List semua client + status
2. Tambah client baru:
   - Nama, Email (menggunakan email asli client), Industry, Website, Logo
   - Pilih service yang diambil (checkbox: Sosmed, Email Blast, WA Blast, SEO, Web Dev)
   - Sistem auto-generate akun menggunakan **email client** + auto-generate password sementara
3. Edit client: update info, tambah/hapus service
4. Per client: lihat & kelola project di masing-masing service
5. Kelola credentials akun client
6. Download laporan client (PDF/Excel)

---

### 8.6 Client Portal (`/client/*`)

**Layout:** Sidebar terpisah (Client Portal branding)

| Halaman | Route | Deskripsi |
|---------|-------|-----------|
| Performance Overview | `/client/dashboard` | Overview semua service yang diambil |
| Service Reports | `/client/reports` | Detail laporan per service & project |
| Notifications | `/client/notifications` | Daftar notifikasi update terbaru |
| Help & Support | `/client/help` | Informasi bantuan |

**Aturan akses:**
- Client hanya bisa lihat service & project yang di-assign ke mereka
- Semua data read-only
- Bisa download dokumen/laporan (PDF & Excel)

**Fitur Notifikasi:**
- Bell icon di navbar client (dengan badge count unread)
- Dropdown notifikasi terbaru (5 terakhir)
- Halaman penuh `/client/notifications` untuk semua notifikasi
- Jenis notifikasi:
  - 📊 **Report Update**: "Laporan Sosmed untuk project X telah diperbarui"
  - 📂 **New Project**: "Project baru 'Y' telah ditambahkan ke service Email Blast Anda"
  - ℹ️ **Info**: Pengumuman umum dari admin
- Notifikasi di-generate otomatis oleh sistem saat:
  - Admin menambah/update report data
  - Admin membuat project baru untuk client
  - Admin menambah service baru untuk client

---

## 9. Migrasi dari Sistem Existing

### Data yang tetap dipertahankan:
- Tabel `profiles`, `clients`, `services`, `client_services` → tetap
- Tabel `email_campaigns` → data di-migrasikan ke `email_blast_reports` via project
- Tabel `campaigns` + `performance_logs` → data di-migrasikan ke `sosmed_reports` via project

### Yang berubah:
- Semua report sekarang harus melalui `projects` (tidak langsung ke client)
- Menu sidebar admin diubah sesuai spesifikasi baru
- Route diubah/ditambah (`/dashboard`, `/email`, `/client`, `/seo`, `/wa-blast`)
- Route `/scheduler` dan `/ai-generator` → dihapus dari navigasi utama
- Client portal tambah `/client/notifications`

---

## 10. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| **Tech Stack** | Next.js, Supabase (PostgreSQL + Auth), TailwindCSS v4, Recharts |
| **Auth** | Supabase Auth + RLS (Row Level Security) |
| **Hosting** | Vercel |
| **Responsif** | Mobile-first, responsive sidebar |
| **Dark Mode** | Default dark theme (sudah ada) |
| **SEO API** | Google Analytics Data API v1 (gratis, quota-based) |
| **Download** | PDF & Excel export untuk semua laporan (admin + client) |
| **Notifikasi** | In-app notifications di client dashboard (bell icon + halaman) |
| **Performance** | < 3s initial load, realtime updates via Supabase realtime |
| **Security** | RLS per tabel, client hanya akses data miliknya |

---

## 11. Prioritas Implementasi

| Fase | Scope | Estimasi |
|------|-------|----------|
| **Fase 1** | Restruktur menu sidebar (Sosmed, Email Blast, WA Blast, SEO, Client), tambah semua tabel baru (`projects`, report tables, `notifications`), update CRM (Client page) dengan project management + auto-generate akun | Prioritas Tinggi |
| **Fase 2** | Refactor Sosmed dashboard ke project-based, update Email Blast ke project-based, bangun WA Blast halaman baru | Prioritas Tinggi |
| **Fase 3** | Bangun halaman SEO (manual input), update Client Portal + notifikasi sistem | Prioritas Tinggi |
| **Fase 4** | Integrasi Google Analytics API untuk SEO, fitur download report (PDF/Excel) untuk admin & client | Prioritas Medium |
| **Fase 5** | Web Development project tracking, polish & optimasi | Prioritas Medium |

---

## 12. Resolved Questions

| # | Pertanyaan | Jawaban |
|---|-----------|--------|
| 1 | Format akun client | ✅ Menggunakan **email asli client** yang diinput saat menambah data client + auto-generate password sementara |
| 2 | Download format | ✅ **Keduanya** — PDF & Excel. Admin juga bisa download laporan, bukan hanya client |
| 3 | WhatsApp blast | ✅ **Service terpisah** — WA Blast jadi service ke-5 dengan menu sendiri (`/wa-blast`) |
| 4 | Web Development | ✅ **Satu arah dari Admin** — Admin yang input milestone, progress, dan upload deliverables. Client hanya view & download |
| 5 | Notifikasi | ✅ **Ya** — Fitur notifikasi in-app di dashboard client (bell icon + halaman notifikasi) |
