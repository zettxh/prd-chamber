import { useBrightnessStore } from '../stores/brightness';

export default function BrightnessSlider() {
  const { level, setLevel } = useBrightnessStore();

  return (
    <div className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
      <span>BRT</span>
      <input
        type="range"
        min={30}
        max={100}
        value={level}
        onChange={e => setLevel(Number(e.target.value))}
        style={{
          WebkitAppearance: 'none',
          width: 72,
          height: 3,
          background: 'var(--border)',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      <span style={{ width: 26, textAlign: 'right' }}>{level}%</span>
    </div>
  );
}
