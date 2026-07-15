# Supabase Database Workflow & Deployment Guide

Dokumen ini menjelaskan alur kerja (workflow) pengelolaan database Supabase untuk proyek **MBZ Dashboard**. Proyek ini memiliki pemisahan environment untuk menjaga data tetap aman selama proses development.

---

## 🌍 Pembagian Environment

Sistem kita menggunakan setidaknya 2 environment utama di Supabase:
1. **Staging** (Project ID: `jrgmoglytvngpzfdaone`) - Digunakan untuk development dan testing.
2. **Production** (Project ID: `ztpvrtaksntygjylumbi`) - Digunakan untuk aplikasi live yang dipakai klien.

### 🔑 Pengaturan `.env` (Environment Variables)
Setiap environment memiliki file `.env` masing-masing yang harus disesuaikan:
- **`.env.staging`**: Berisi URL dan Anon Key untuk project Supabase Staging.
- **`.env.production`**: Berisi URL dan Anon Key untuk project Supabase Production.
*(Catatan: Saat mendeploy ke Vercel untuk Production, pastikan nilai yang dimasukkan ke menu Environment Variables di Vercel mengambil dari `.env.production`)*.

---

## 💻 Panduan Migrasi Database untuk Developer Selanjutnya

Jika kamu membuat fitur baru yang membutuhkan **perubahan struktur tabel / database**, ikuti langkah-langkah di bawah ini:

### Langkah 1: Hubungkan Supabase CLI ke Staging (Development)
Saat sedang ngoding fitur baru, pastikan terminal-mu terhubung ke database **Staging**:
```bash
npx supabase link --project-ref jrgmoglytvngpzfdaone
```

### Langkah 2: Buat File Migrasi
Alih-alih membuat tabel langsung dari Dashboard Supabase, selalu gunakan file migrasi lokal agar strukturnya tersimpan di Git:
1. Buat file migrasi baru:
   ```bash
   npx supabase migration new nama_fitur_baru
   ```
2. Buka file `.sql` yang terbuat di folder `supabase/migrations/` dan tulis kode SQL-mu (CREATE TABLE, ALTER, dll).
3. Push perubahan struktur ini ke Staging untuk di-test:
   ```bash
   npx supabase db push
   ```

### Langkah 3: Deploy Struktur Database ke Production
Jika fitur sudah selesai diuji di Staging dan **siap naik ke Production**, kamu harus mem-push struktur database tersebut ke project Production:

1. Ubah koneksi Supabase CLI ke project **Production**:
   ```bash
   npx supabase link --project-ref ztpvrtaksntygjylumbi
   ```
2. Dorong (push) file migrasi ke Production:
   ```bash
   npx supabase db push
   ```
3. **PENTING!** Kembalikan koneksi ke **Staging** agar kamu tidak tidak sengaja mengutak-atik database production saat melanjutkan ngoding:
   ```bash
   npx supabase link --project-ref jrgmoglytvngpzfdaone
   ```

### Ringkasan Urutan Perintah Aman (Cheat Sheet)
```bash
# Mau push ke Production?
npx supabase link --project-ref ztpvrtaksntygjylumbi
npx supabase db push

# KEMBALI KE STAGING SETELAH SELESAI
npx supabase link --project-ref jrgmoglytvngpzfdaone
```
