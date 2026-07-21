// Dummy project list untuk Dashboard
export const dummyProjects = [
  { id: '1', title: 'Aplikasi POS Kopi', date: '2026-07-18', status: 'prd_ready' as const },
  { id: '2', title: 'Marketplace Freelance', date: '2026-07-15', status: 'structured' as const },
  { id: '3', title: 'Sistem Booking Barbershop', date: '2026-07-10', status: 'clarifying' as const },
  { id: '4', title: 'Platform Course Online', date: '2026-07-05', status: 'draft' as const },
];

// 5 pertanyaan dummy untuk Halaman Klarifikasi (Phase A)
export const dummyQuestions = [
  {
    id: 'q1',
    type: 'text' as const,
    label: 'Ceritakan seseorang yang butuh aplikasi ini. Sekarang mereka ngapain buat ngatasi masalahnya?',
    required: true,
    placeholder: 'Ketik jawaban...',
  },
  {
    id: 'q2',
    type: 'radio' as const,
    label: 'Satu hal yang harus user selesaikan di kunjungan pertama, sebelum nutup aplikasi?',
    required: false,
    options: ['Buat PRD pertama', 'Lihat contoh PRD', 'Isi judul proyek', 'Daftar akun'],
  },
  {
    id: 'q3',
    type: 'chip' as const,
    label: 'Pilih 3 fitur paling penting yang wajib ada di aplikasi ini? (boleh pilih beberapa)',
    required: false,
    options: ['Template PRD siap pakai', 'Bagian tulis tujuan', 'Daftar fitur produk', 'Catatan revisi', 'Tombol cetak PRD'],
  },
  {
    id: 'q4',
    type: 'chip' as const,
    label: 'Apa unggulnya aplikasi ini dibanding cara user sekarang bikin PRD?',
    required: false,
    options: ['Lebih rapi', 'Lebih cepat', 'Lebih gampang', 'Ada panduan'],
  },
  {
    id: 'q5',
    type: 'radio' as const,
    label: 'Apa yang bikin user terus pakai aplikasi ini, bukan cuma coba sekali doang?',
    required: false,
    options: ['Lihat proyek lama', 'Bisa edit PRD', 'Template baru', 'Dapat notifikasi'],
  },
];

// Dummy struktur fitur (5 fase) untuk Halaman Mind Map
export const dummyStructure = {
  phases: [
    {
      phase_number: 1,
      phase_name: 'Foundation',
      features: [
        { name: 'Autentikasi', description: 'Login/logout dengan JWT', complexity: 'low', sub_features: ['Halaman login', 'JWT token', 'Protected routes'] },
        { name: 'Dashboard', description: 'List project + buat baru', complexity: 'low', sub_features: ['Card project', 'Empty state', 'Buat proyek'] },
      ],
    },
    {
      phase_number: 2,
      phase_name: 'Input & Klarifikasi',
      features: [
        { name: 'Input Ide Kasar', description: 'Textarea + dropdown bahasa', complexity: 'low', sub_features: ['Textarea', 'Language selector', 'Validasi minimal kata'] },
        { name: 'Klarifikasi', description: '5 pertanyaan dinamis', complexity: 'medium', sub_features: ['Text input Q1', 'Chip Q2-Q5', 'Skip logic', 'Counter progress'] },
      ],
    },
    {
      phase_number: 3,
      phase_name: 'Generasi & Struktur',
      features: [
        { name: 'Mind Map', description: 'Visual struktur fitur', complexity: 'medium', sub_features: ['Mermaid flowchart', 'Node click → panel', 'Modal detail'] },
        { name: 'Generate PRD', description: '7 section PRD dengan streaming', complexity: 'high', sub_features: ['SSE streaming', 'Markdown renderer', 'Progress checklist'] },
      ],
    },
    {
      phase_number: 4,
      phase_name: 'Edit & Export',
      features: [
        { name: 'Edit PRD', description: 'Edit inline per section', complexity: 'medium', sub_features: ['Edit mode toggle', 'Auto-save debounce', 'Version snapshot'] },
        { name: 'Export', description: 'MD/HTML/PDF/DOCX', complexity: 'medium', sub_features: ['Format selector', 'SVG diagram embed', 'Download file'] },
      ],
    },
    {
      phase_number: 5,
      phase_name: 'Share & History',
      features: [
        { name: 'Share Link', description: 'Token-based sharing', complexity: 'low', sub_features: ['Generate token', 'Expiry options', 'Revoke'] },
        { name: 'Version History', description: 'Snapshot + diff + restore', complexity: 'low', sub_features: ['Timeline', 'Compare diff', 'Restore'] },
      ],
    },
  ],
};

// Dummy 7 section PRD untuk Halaman PRD Lengkap
export const dummyPrdContent: Record<string, string> = {
  'executive-summary': `## Executive Summary\n\nAplikasi POS Kopi adalah sistem point-of-sale yang dirancang khusus untuk kedai kopi skala kecil hingga menengah. Target pengguna adalah pemilik kedai kopi independen yang ingin mengelola pesanan, inventori, dan laporan penjualan dalam satu platform.\n\n**Visi:** Menjadi standar operasional untuk kedai kopi di Indonesia.\n\n**Key Metrics:**\n- Mengurangi waktu antrian rata-rata 40%\n- Akurasi inventori 99%\n- Adopsi target: 500 kedai kopi di tahun pertama`,
  'problem-statement': `## Problem Statement\n\n**Masalah Utama:**\n1. Pemilik kedai kopi masih menggunakan catatan manual (buku/kertas) untuk mencatat pesanan — rawan hilang dan sulit direkonsiliasi\n2. Tidak ada visibilitas real-time ke stok bahan baku — sering kehabisan bahan di tengah jam sibuk\n3. Laporan penjualan dibuat manual di akhir bulan — memakan waktu 2-3 jam dan rentan kesalahan\n\n**Pain Points:**\n| Pain Point | Frekuensi | Dampak |\n|---|---|---|\n| Pesanan salah dicatat | 3-5x/hari | Komplain pelanggan |\n| Stok habis saat peak hour | 2-3x/minggu | Kehilangan penjualan |\n| Rekonsiliasi akhir bulan | 1x/bulan | 2-3 jam kerja |`,
  'core-features': `## Core Features\n\n### MVP (Fase 1)\n- **Pencatatan Pesanan:** Input pesanan dengan kustomisasi (ukuran, gula, es, ekstra shot)\n- **Manajemen Menu:** CRUD item menu dengan kategori dan harga\n- **Laporan Harian:** Ringkasan penjualan per hari (total transaksi, item terlaris, jam sibuk)\n\n### Fase 2\n- **Manajemen Inventori:** Tracking stok bahan baku otomatis (kopi, susu, sirup)\n- **Notifikasi Stok Rendah:** Alert saat stok di bawah threshold\n- **Laporan Bulanan:** P&L sederhana dengan grafik\n\n### Fase 3\n- **Integrasi Pembayaran:** QRIS, GoPay, OVO\n- **Program Loyalitas:** Poin per transaksi, redeem diskon\n- **Multi-outlet:** Satu dashboard untuk beberapa cabang`,
  'user-flow': `## User Flow / Journey\n\n### Flow Utama — Kasir Mencatat Pesanan\n\n\`\`\`mermaid\nflowchart TD\n    A[Pelanggan datang] --> B[Kasir buka aplikasi]\n    B --> C[Pilih menu dari daftar]\n    C --> D[Kustomisasi pesanan]\n    D --> E[Hitung total]\n    E --> F{Pembayaran}\n    F -->|Cash| G[Kasir input jumlah]\n    F -->|QRIS| H[Tampilkan QR]\n    G --> I[Cetak struk]\n    H --> I\n    I --> J[Kirim pesanan ke dapur]\n    J --> K[Update stok otomatis]\n\`\`\``,
  'functional-requirements': `## Functional Requirements\n\n### FR-1: Pencatatan Pesanan\n- **AC-1.1:** User dapat menambah item menu ke pesanan dalam <3 klik\n- **AC-1.2:** Sistem menghitung total otomatis termasuk pajak 11%\n- **AC-1.3:** Kustomisasi pesanan (size, sugar level, ice level) tersimpan per item\n\n### FR-2: Manajemen Menu\n- **AC-2.1:** Admin dapat CRUD item menu dengan foto\n- **AC-2.2:** Item dapat dikategorikan (kopi, non-kopi, makanan)\n- **AC-2.3:** Perubahan menu langsung tersedia di kasir tanpa reload\n\n### FR-3: Laporan\n- **AC-3.1:** Laporan harian tersedia dalam <5 detik setelah request\n- **AC-3.2:** Export laporan ke PDF/CSV\n- **AC-3.3:** Filter laporan by tanggal, kategori, item`,
  'architecture': `## System Architecture\n\n\`\`\`mermaid\nflowchart TB\n    subgraph Client[Client]\n        Web[React SPA]\n        Mobile[React Native]\n    end\n    \n    subgraph Gateway[API Gateway]\n        Nginx[Nginx Reverse Proxy]\n    end\n    \n    subgraph Backend[Backend Services]\n        API[Node.js + Hono]\n        Auth[Auth Service - JWT]\n        Worker[Background Worker]\n    end\n    \n    subgraph Data[Data Layer]\n        DB[(PostgreSQL)]\n        Cache[(Redis)]\n        Storage[S3 - Gambar Menu]\n    end\n    \n    Web --> Nginx\n    Mobile --> Nginx\n    Nginx --> API\n    API --> Auth\n    API --> DB\n    API --> Cache\n    Worker --> DB\n    API --> Storage\n\`\`\``,
  'database-schema': `## Database Schema\n\n\`\`\`mermaid\nerDiagram\n    users ||--o{ orders : places\n    users ||--o{ menu_items : manages\n    orders ||--|{ order_items : contains\n    menu_items ||--o{ order_items : references\n    menu_items }o--|| categories : belongs_to\n    orders ||--o{ payments : has\n    \n    users {\n        uuid id PK\n        string name\n        string email\n        string password_hash\n        enum role\n    }\n    \n    orders {\n        uuid id PK\n        uuid user_id FK\n        decimal total\n        enum status\n        datetime created_at\n    }\n    \n    order_items {\n        uuid id PK\n        uuid order_id FK\n        uuid menu_item_id FK\n        int quantity\n        json customizations\n    }\n    \n    menu_items {\n        uuid id PK\n        string name\n        decimal price\n        uuid category_id FK\n        string image_url\n    }\n    \n    categories {\n        uuid id PK\n        string name\n    }\n\`\`\``,
};

// Dummy task breakdown
export const dummyTasks = [
  { id: '1', phase: 'Fase 1: Foundation', feature: 'Autentikasi', task: 'Buat halaman login', description: 'Implement login page dengan form', effort: 'S' as const, is_done: false },
  { id: '2', phase: 'Fase 1: Foundation', feature: 'Autentikasi', task: 'Implementasi JWT auth flow', description: 'Setup JWT token handling', effort: 'M' as const, is_done: false },
  { id: '3', phase: 'Fase 1: Foundation', feature: 'Dashboard', task: 'Buat card list project', description: 'Project cards dengan status', effort: 'S' as const, is_done: true },
  { id: '4', phase: 'Fase 2: Input', feature: 'Input Ide', task: 'Textarea + dropdown bahasa', description: 'Form input ide dengan language selector', effort: 'S' as const, is_done: true },
  { id: '5', phase: 'Fase 2: Input', feature: 'Klarifikasi', task: 'Render 5 pertanyaan dinamis', description: 'QuestionCard + chip interaction', effort: 'M' as const, is_done: false },
  { id: '6', phase: 'Fase 2: Input', feature: 'Klarifikasi', task: 'Validasi dan submit jawaban', description: 'Form validation + navigation', effort: 'M' as const, is_done: false },
  { id: '7', phase: 'Fase 3: Generate', feature: 'Mind Map', task: 'Mermaid flowchart renderer', description: 'MermaidDiagram component', effort: 'L' as const, is_done: false },
  { id: '8', phase: 'Fase 3: Generate', feature: 'Generate PRD', task: 'SSE streaming + Markdown renderer', description: 'MarkdownViewer + MermaidBlock', effort: 'L' as const, is_done: false },
];

// Dummy version history
export const dummyVersions = [
  { id: 'v4', version: 4, date: '2026-07-21 09:15', summary: 'Edit manual: Core Features section' },
  { id: 'v3', version: 3, date: '2026-07-20 14:30', summary: 'Generate ulang: System Architecture' },
  { id: 'v2', version: 2, date: '2026-07-20 10:00', summary: 'Edit manual: Problem Statement + User Flow' },
  { id: 'v1', version: 1, date: '2026-07-19 16:45', summary: 'PRD pertama — generate dari ide kasar' },
];
