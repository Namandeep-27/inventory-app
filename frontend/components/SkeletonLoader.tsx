'use client';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

interface SkeletonBoxProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonBox({ className = '', style }: SkeletonBoxProps) {
  return (
    <div
      className={`bg-slate-200 rounded-xl animate-pulse ${className}`}
      style={style}
    />
  );
}

interface SkeletonTextProps {
  width?: string;
  className?: string;
}

export function SkeletonText({ width = '100%', className = '' }: SkeletonTextProps) {
  return <SkeletonBox className={`h-4 ${className}`} style={{ width }} />;
}

interface SkeletonTableRowProps {
  columns?: number;
}

export function SkeletonTableRow({ columns = 6 }: SkeletonTableRowProps) {
  return (
    <tr className="animate-fade-in">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBox className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function SkeletonLoader({ className = '', lines = 3 }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
