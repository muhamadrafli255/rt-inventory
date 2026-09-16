# 📦 RT Inventory

Sistem Manajemen Inventaris & Peminjaman Barang RT berbasis Web modern, responsif, dan aman. Aplikasi ini memudahkan pengurus RT (Admin) dalam mengelola data barang dan warga, serta memudahkan Warga dalam melakukan pengajuan peminjaman barang fasilitas RT secara digital.

---

## ✨ Fitur Utama

### 👥 **Otentikasi & Manajemen Akun**
* **Registrasi & Login**: Keamanan dengan enkripsi kata sandi **Argon2id** dan otentikasi berbasis **JWT** (Access Token & Refresh Token via HTTP-only Cookies).
* **Role-Based Access Control (RBAC)**:
  * **ADMIN**: Hak akses penuh untuk mengelola barang, kategori, data warga, dan pengajuan peminjaman.
  * **WARGA**: Meminjam barang, melihat katalog barang, melacak riwayat "Pinjaman Saya", serta mengelola profil pribadi.
* **Pengaturan Profil & Keamanan**: Setiap pengguna dapat memperbarui nama, nomor telepon, alamat rumah, dan mengubah password akun.
* **Kelola Warga (Khusus Admin)**: Menambah, mengubah, mencari, dan menghapus (soft-delete) data warga RT.

### 📦 **Manajemen Barang & Kategori**
* **Katalog Barang**: Menampilkan daftar barang inventaris beserta kategori, kondisi, lokasi penyimpanan, dan stok tersedia.
* **Kelola Kategori**: Admin dapat mengelola kategori barang untuk pengelompokan yang rapi.
* **Tombol Pinjam Langsung**: Warga dapat mengajukan peminjaman barang langsung melalui halaman katalog barang.

### 📋 **Manajemen Peminjaman**
* **Pengajuan Peminjaman**: Warga memilih barang, tanggal peminjaman, estimasi pengembalian, dan jumlah unit.
* **Persetujuan (Approval Workflow)**: Admin dapat menyetujui (*Approve*) atau menolak (*Reject*) pengajuan peminjaman.
* **Pengembalian Barang**: Mengembalikan barang yang sedang dipinjam yang secara otomatis mengembalikan stok barang.
* **Halaman "Pinjaman Saya"**: Warga memiliki halaman khusus untuk melacak status peminjaman mereka sendiri.

### 📊 **Dashboard & Statistik**
* **Statistik Ringkas**: Menampilkan total barang, unit tersedia, peminjaman aktif, dan statistik warga secara *real-time*.

---

## 🛠️ Teknologi (Tech Stack)

### **Backend**
* **Runtime**: Node.js
* **Framework**: Express.js (v5)
* **Database & ORM**: MySQL & Prisma ORM (v6)
* **Keamanan & Token**: Argon2 (Password Hashing), Jose (JWT Access & Refresh Token), Helmet, Express Rate Limit, Cookie Parser, CORS
* **Validasi**: Zod

### **Frontend**
* **Framework**: React 19 (Vite)
* **Routing**: React Router v7
* **Styling**: Tailwind CSS v4
* **Ikon**: Lucide React
* **HTTP Client**: Axios (dengan Interceptor penanganan token & error)

---

## 📁 Struktur Proyek

```text
rt-inventory/
├── backend/                  # Server REST API Node.js & Prisma
│   ├── prisma/               # Skema database & file seed
│   ├── src/
│   │   ├── controllers/      # Handler HTTP Request
│   │   ├── middlewares/      # Auth & Error handling middlewares
│   │   ├── routes/           # Endpoint API
│   │   ├── services/         # Logika Bisnis & Query Prisma
│   │   ├── utils/            # Helper fungsi (JWT, Async Handler, Error Response)
│   │   └── validators/       # Validasi input Zod
│   ├── .env                  # Konfigurasi Environment Backend
│   └── package.json
│
├── frontend/                 # Aplikasi Frontend React (Vite)
│   ├── src/
│   │   ├── api/              # Axios instance & helper API endpoints
│   │   ├── components/       # Komponen UI Reusable (Modal, Badge, Form)
│   │   ├── context/          # State Global (AuthContext)
│   │   ├── layouts/          # Layout Dashboard (Sidebar, Header, Mobile Nav)
│   │   ├── pages/            # Halaman (Dashboard, Items, Loans, Users, Settings, Login, Register)
│   │   └── routes/           # Guard Rute (ProtectedRoute, RoleGuard)
│   ├── .env                  # Konfigurasi Environment Frontend
│   └── package.json
│
└── README.md
```

---

## 🚀 Panduan Instalasi & Cara Menjalankan

### **Prasyarat Sistem**
* [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
* [MySQL Database Server](https://www.mysql.com/) (XAMPP, MySQL Workbench, atau Docker)

---

### **1. Setup Backend**

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```

2. Install dependensi modul Node.js:
   ```bash
   npm install
   ```

3. Buat file `.env` di dalam folder `backend` dan sesuaikan nilainya:
   ```env
   PORT=5001
   NODE_ENV=development

   # Sesuaikan kredensial MySQL lokal Anda
   DATABASE_URL="mysql://root:@localhost:3306/rt_inventory"

   # Secret Key JWT (bebas diubah untuk lingkungan produksi)
   JWT_ACCESS_SECRET="ganti_dengan_secret_access_token_bebas_dan_panjang"
   JWT_REFRESH_SECRET="ganti_dengan_secret_refresh_token_bebas_dan_panjang"

   ACCESS_TOKEN_EXPIRES_IN="15m"
   REFRESH_TOKEN_EXPIRES_IN="30d"

   FRONTEND_URL="http://localhost:5173"
   ```

4. Buat database di MySQL (misal: `rt_inventory`), lalu jalankan migrasi Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

5. *(Opsional)* Jalankan Seeder untuk mengisi data awal (Admin, Warga, Kategori, & Barang sampel):
   ```bash
   npm run prisma:seed
   ```

6. Jalankan server Backend:
   ```bash
   npm run dev
   ```
   Server backend akan berjalan di **`http://localhost:5001`**.

---

### **2. Setup Frontend**

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependensi modul Node.js:
   ```bash
   npm install
   ```

3. Buat file `.env` di dalam folder `frontend`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

4. Jalankan server pengembangan Frontend:
   ```bash
   npm run dev
   ```
   Aplikasi frontend dapat diakses di browser pada **`http://localhost:5173`**.

---

## 🔑 Akun Default (Hasil Seed Data)

Jika Anda menjalankan `npm run prisma:seed`, Anda dapat menggunakan akun berikut untuk masuk:

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@rt.com` | `admin123` | Akses Penuh (Kelola Barang, Kategori, Warga, & Peminjaman) |
| **WARGA** | `warga@rt.com` | `warga123` | Pinjam Barang, Lihat Katalog, Pinjaman Saya, & Pengaturan |

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan pengelolaan inventaris RT dan berlisensi **ISC**.
