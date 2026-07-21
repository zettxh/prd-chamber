import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const btnPrimary: React.CSSProperties = {
  background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700,
  border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, fontSize: 14,
  boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
  transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
};

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: 'none', outline: 'none',
  color: 'var(--text-primary)', boxShadow: 'var(--shadow-D1)',
  width: '100%', padding: '10px 16px', borderRadius: 12, fontSize: 14,
  fontFamily: 'Inter, sans-serif', transition: 'box-shadow 200ms',
};

export default function InputIdeaPage() {
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/project/dummy-1/clarify');
  };

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>
        Ceritakan ide kamu
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Tulis ide kasarnya dulu. Nanti kita perjelas bareng-bareng.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as 'id' | 'en')}
          className="px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
          style={{
            background: 'var(--bg)', border: 'none', color: 'var(--text-primary)',
            cursor: 'pointer', boxShadow: 'var(--shadow-L1)', width: 'fit-content',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <option value="id">🇮🇩 Bahasa Indonesia</option>
          <option value="en">🇬🇧 English</option>
        </select>

        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
          placeholder="Contoh: Saya ingin bikin aplikasi POS untuk kedai kopi. Kasir bisa catat pesanan dengan kustomisasi ukuran dan gula, lalu otomatis hitung total..."
          rows={5}
          required
          onFocus={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1-focus)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
        />

        <button
          type="submit"
          style={btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
          onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; e.currentTarget.style.transform = 'scale(0.985)'; }}
          onMouseUp={e => { e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Lanjut → Klarifikasi
        </button>
      </form>
    </Layout>
  );
}
