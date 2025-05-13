'use client';

import { formatDistanceToNow } from 'date-fns';

interface DataFreshnessProps {
  timestamp: string;
}

export function DataFreshness({ timestamp }: DataFreshnessProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
      <span>Data last updated:</span>
      <time dateTime={timestamp}>
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </time>
    </div>
  );
} 