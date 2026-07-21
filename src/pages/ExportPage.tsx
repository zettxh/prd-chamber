import { useState } from 'react';
import Layout from '../components/Layout';

type ExportFormat = 'md' | 'html' | 'pdf' | 'docx';

const formats: { key: ExportFormat; label: string; icon: string; desc: string }[] = [
  { key: 'md', label: 'Markdown', icon: '📝', desc: 'File .md untuk diedit di text editor' },
  { key: 'html', label: 'HTML', icon: '🌐', desc: 'Halaman web statis dengan styling lengkap' },
  { key: 'pdf', label: 'PDF', icon: '📄', desc: 'Dokumen siap cetak atau kirim ke klien' },
  { key: 'docx', label: 'DOCX', icon: '📋', desc: 'Microsoft Word — bisa diedit lebih lanjut' },
];

export default function ExportPage() {
  const [selected, setSelected] = useState<ExportFormat | null>(null);
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (!selected) return;
    setIsDownloading(true);
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 1200);
  };

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

  return (
    <Layout showBack>
      <h1
        className="text-[28px] font-bold mb-1"
        style={{
          color: 'var(--text-primary)',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: -0.4,
        }}
      >
        Export PRD
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Pilih format dan opsi untuk mengunduh PRD.
      </p>

      {/* Format selector */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {formats.map((f) => (
          <button
            key={f.key}
            onClick={() => setSelected(f.key)}
            className="p-4 rounded-2xl text-left flex items-start gap-3 transition-all"
            style={{
              background: 'var(--bg)',
              boxShadow: selected === f.key ? 'var(--shadow-D1)' : 'var(--shadow-L1)',
              border: selected === f.key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: selected === f.key ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                {f.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {f.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Options */}
      <div
        className="p-5 rounded-2xl mb-8 flex flex-col gap-4"
        style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}
      >
        <h2
          className="text-sm font-bold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Opsi Export
        </h2>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Sertakan diagram (Mermaid)
          </span>
          <button
            onClick={() => setIncludeDiagrams(!includeDiagrams)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              background: includeDiagrams ? 'var(--accent)' : 'var(--bg)',
              boxShadow: 'var(--shadow-D1)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{
                transform: includeDiagrams ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: 'var(--shadow-L1)',
              }}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Sertakan Table of Contents
          </span>
          <button
            onClick={() => setIncludeToc(!includeToc)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              background: includeToc ? 'var(--accent)' : 'var(--bg)',
              boxShadow: 'var(--shadow-D1)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{
                transform: includeToc ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: 'var(--shadow-L1)',
              }}
            />
          </button>
        </label>
      </div>

      {/* Download CTA */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={!selected || isDownloading}
          style={{
            ...btnPrimary,
            opacity: selected && !isDownloading ? 1 : 0.4,
            cursor: selected && !isDownloading ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (selected && !isDownloading)
              e.currentTarget.style.boxShadow =
                '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)';
          }}
          onMouseLeave={(e) => {
            if (selected && !isDownloading)
              e.currentTarget.style.boxShadow =
                '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)';
          }}
        >
          {isDownloading ? 'Menyiapkan...' : selected ? `Unduh ${formats.find(f => f.key === selected)?.label}` : 'Pilih format dulu'}
        </button>
      </div>

      {isDownloading && (
        <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          Sedang menyiapkan file export...
        </p>
      )}
    </Layout>
  );
}
