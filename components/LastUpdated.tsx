'use client';

import { formatDistanceToNow } from 'date-fns';

interface LastUpdatedProps {
  timestamp: Date;
}

export function LastUpdated({ timestamp }: LastUpdatedProps) {
  return (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <span>Last updated:</span>
      <time dateTime={timestamp.toISOString()}>
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </time>
    </div>
  );
} 