export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="term-panel" style={{
          padding: '14px 18px', height: 44,
          animation: 'term-pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 200}ms`,
        }} />
      ))}
    </div>
  );
}
