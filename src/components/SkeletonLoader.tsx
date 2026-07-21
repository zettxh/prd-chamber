interface Props { count?: number; height?: string; }

export default function SkeletonLoader({ count = 3, height = '68px' }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl" style={{ height, background: 'var(--bg)', boxShadow: 'var(--shadow-L1)', animation: 'breathe 2.2s ease-in-out infinite' }} />
      ))}
    </div>
  );
}
