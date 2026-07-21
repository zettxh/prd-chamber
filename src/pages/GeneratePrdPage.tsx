import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface SectionProgress {
  key: string;
  label: string;
  status: 'pending' | 'generating' | 'done';
}

const sections: SectionProgress[] = [
  { key: 'executive-summary', label: 'Executive Summary', status: 'pending' },
  { key: 'problem-statement', label: 'Problem Statement', status: 'pending' },
  { key: 'core-features', label: 'Core Features', status: 'pending' },
  { key: 'user-flow', label: 'User Flow / Journey', status: 'pending' },
  { key: 'functional-requirements', label: 'Functional Requirements', status: 'pending' },
  { key: 'architecture', label: 'System Architecture', status: 'pending' },
  { key: 'database-schema', label: 'Database Schema', status: 'pending' },
];

const sectionContents: Record<string, string> = {
  'executive-summary': `## Executive Summary

Aplikasi POS Kopi adalah sistem point-of-sale yang dirancang khusus untuk kedai kopi skala kecil hingga menengah. Memungkinkan pemilik kedai mengelola pesanan, inventori, dan laporan penjualan dalam satu platform.

**Visi:** Menjadi standar operasional untuk kedai kopi di Indonesia.

**Key Metrics:**
- Mengurangi waktu antrian rata-rata 40%
- Akurasi inventori 99%
- Adopsi target: 500 kedai kopi di tahun pertama`,
  'problem-statement': `## Problem Statement

**Masalah Utama:**
1. Pemilik kedai kopi masih menggunakan catatan manual
2. Tidak ada visibilitas real-time ke stok bahan baku
3. Laporan penjualan dibuat manual di akhir bulan

**Pain Points:**
- Pesanan salah dicatat: 3-5x/hari
- Stok habis saat peak hour: 2-3x/minggu
- Rekonsiliasi akhir bulan: 2-3 jam kerja`,
  'core-features': `## Core Features

### MVP (Fase 1)
- Pencatatan Pesanan dengan kustomisasi
- Manajemen Menu: CRUD + kategori
- Laporan Harian: ringkasan penjualan

### Fase 2
- Manajemen Inventori: tracking stok otomatis
- Notifikasi Stok Rendah
- Laporan Bulanan: P&L sederhana

### Fase 3
- Integrasi Pembayaran: QRIS, GoPay, OVO
- Program Loyalitas: poin + redeem
- Multi-outlet: dashboard cabang`,
  'user-flow': `## User Flow / Journey

\`\`\`mermaid
flowchart TD
    A[Pelanggan datang] --> B[Kasir buka aplikasi]
    B --> C[Pilih menu dari daftar]
    C --> D[Kustomisasi pesanan]
    D --> E[Hitung total]
    E --> F{Pembayaran}
    F -->|Cash| G[Kasir input jumlah]
    F -->|QRIS| H[Tampilkan QR]
    G --> I[Cetak struk]
    H --> I
    I --> J[Kirim ke dapur]
    J --> K[Update stok otomatis]
\`\`\``,
  'functional-requirements': `## Functional Requirements

### FR-1: Pencatatan Pesanan
- **AC-1.1:** User menambah item menu dalam <3 klik
- **AC-1.2:** Sistem menghitung total otomatis + pajak 11%
- **AC-1.3:** Kustomisasi tersimpan per item

### FR-2: Manajemen Menu
- **AC-2.1:** Admin dapat CRUD item menu dengan foto
- **AC-2.2:** Item dikategorikan (kopi, non-kopi, makanan)
- **AC-2.3:** Perubahan menu langsung tersedia tanpa reload`,
  'architecture': `## System Architecture

\`\`\`mermaid
flowchart TB
    subgraph Client[Client]
        Web[React SPA]
    end
    subgraph Gateway[API Gateway]
        Nginx[Nginx Reverse Proxy]
    end
    subgraph Backend[Backend Services]
        API[Node.js + Hono]
        Auth[Auth Service - JWT]
    end
    subgraph Data[Data Layer]
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end
    Web --> Nginx
    Nginx --> API
    API --> Auth
    API --> DB
    API --> Cache
\`\`\``,
  'database-schema': `## Database Schema

\`\`\`mermaid
erDiagram
    users ||--o{ orders : places
    users ||--o{ menu_items : manages
    orders ||--|{ order_items : contains
    menu_items ||--o{ order_items : references
    menu_items }o--|| categories : belongs_to
    
    users {
        uuid id PK
        string name
        string email
        enum role
    }
    
    orders {
        uuid id PK
        uuid user_id FK
        decimal total
        enum status
    }
    
    order_items {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        int quantity
    }
    
    menu_items {
        uuid id PK
        string name
        decimal price
        uuid category_id FK
    }
\`\`\``,
};

export default function GeneratePrdPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<SectionProgress[]>([...sections]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [output, setOutput] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const generateNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= sections.length) {
        setIsGenerating(false);
        setIsDone(true);
        return prev;
      }

      const key = sections[next].key;
      setProgress((p) =>
        p.map((s, i) => {
          if (i === next) return { ...s, status: 'generating' };
          return s;
        })
      );

      // Simulate streaming delay
      setTimeout(() => {
        setOutput((o) => ({ ...o, [key]: sectionContents[key] }));
        setProgress((p) =>
          p.map((s, i) => {
            if (i === next) return { ...s, status: 'done' };
            return s;
          })
        );
      }, 800 + Math.random() * 600);

      return next;
    });
  }, []);

  useEffect(() => {
    if (isGenerating && currentIndex < sections.length - 1) {
      const timer = setTimeout(generateNext, 400);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, currentIndex, generateNext]);

  const startGeneration = () => {
    setIsGenerating(true);
    setCurrentIndex(-1);
    setOutput({});
    setProgress(sections.map((s) => ({ ...s, status: 'pending' })));
    setIsDone(false);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const btnPrimary: React.CSSProperties = {
    background: 'var(--bg)',
    color: 'var(--accent)',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    padding: '10px 22px',
    borderRadius: 12,
    fontSize: 14,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const doneCount = progress.filter((s) => s.status === 'done').length;

  return (
    <Layout showBack>
      <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* ═════ LEFT: Progress Checklist ═════ */}
        <div style={{ width: 280, minWidth: 280 }}>
          <h1
            className="text-2xl font-bold mb-6"
            style={{
              color: 'var(--text-primary)',
              fontFamily: '"Playfair Display", serif',
              letterSpacing: -0.3,
            }}
          >
            Generate PRD
          </h1>

          <div
            className="p-5 rounded-2xl mb-4"
            style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
                Progress
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                {doneCount}/{sections.length}
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden mb-4"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(doneCount / sections.length) * 100}%`,
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px var(--accent-soft)',
                }}
              />
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-2">
              {progress.map((s) => (
                <div key={s.key} className="flex items-center gap-2.5 py-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: 'var(--bg)',
                      color:
                        s.status === 'done'
                          ? 'var(--success)'
                          : s.status === 'generating'
                          ? 'var(--accent)'
                          : 'var(--text-secondary)',
                      boxShadow:
                        s.status === 'done'
                          ? 'var(--shadow-D1)'
                          : 'var(--shadow-L1)',
                      animation: s.status === 'generating' ? 'breathe 1.2s infinite' : 'none',
                    }}
                  >
                    {s.status === 'done' ? '✓' : s.status === 'generating' ? '⋯' : '○'}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color:
                        s.status === 'done'
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      fontWeight: s.status === 'done' ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {!isGenerating && !isDone && (
            <button
              onClick={startGeneration}
              style={btnPrimary}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')
              }
            >
              ▶ Mulai Generate
            </button>
          )}

          {isGenerating && (
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Men-generate section...
            </p>
          )}

          {isDone && (
            <button
              onClick={() => navigate('/project/dummy-1/prd')}
              style={btnPrimary}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')
              }
            >
              Lihat PRD Lengkap →
            </button>
          )}
        </div>

        {/* ═════ RIGHT: Generated output ═════ */}
        <div
          ref={outputRef}
          className="flex-1 rounded-2xl p-6 overflow-y-auto"
          style={{
            background: 'var(--bg)',
            boxShadow: 'var(--shadow-D1)',
            maxHeight: 'calc(100vh - 220px)',
          }}
        >
          {Object.keys(output).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div style={{ fontSize: 48, opacity: 0.25, marginBottom: 12 }}>📝</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
                Klik <strong style={{ color: 'var(--accent)' }}>Mulai Generate</strong> untuk memulai simulasi generasi PRD.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sections.map((s) => {
                const content = output[s.key];
                if (!content) return null;
                return (
                  <div
                    key={s.key}
                    className="p-5 rounded-2xl transition-all"
                    style={{
                      background: 'var(--bg)',
                      boxShadow: 'var(--shadow-L1)',
                      animation: 'slideIn 0.4s ease-out',
                    }}
                  >
                    <pre
                      className="text-sm whitespace-pre-wrap"
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        color: 'var(--text-primary)',
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {content}
                    </pre>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
