interface Props {
  count?: number;
  height?: string;
}

export default function SkeletonLoader({ count = 3, height = '80px' }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-md animate-pulse"
          style={{
            height,
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        />
      ))}
    </div>
  );
}
