import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function InputIdeaPage() {
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 10) {
      alert('⚠️ Ide terlalu singkat (minimal 10 kata). Hasil PRD mungkin kurang detail.');
      // Non-blocking — tetap lanjut
    }
    navigate('/project/dummy-1/clarify');
  };

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Ceritakan ide kamu
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Tulis ide kasarnya dulu. Nanti kita perjelas bareng-bareng.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'id' | 'en')}
            className="px-3 py-2 rounded-md text-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <option value="id">🇮🇩 Bahasa Indonesia</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          className="w-full px-4 py-3 rounded-md text-sm resize-y min-h-[120px]"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-inset)',
          }}
          placeholder="Contoh: Saya ingin bikin aplikasi POS untuk kedai kopi. Kasir bisa catat pesanan dengan kustomisasi ukuran dan gula, lalu otomatis hitung total. Pemilik bisa lihat laporan penjualan harian. Aplikasi ini untuk kedai kecil dengan 1-3 karyawan..."
          rows={5}
          required
        />

        <button
          type="submit"
          className="mt-4 px-6 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
            color: '#fff',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          Lanjut → Klarifikasi
        </button>
      </form>
    </Layout>
  );
}
