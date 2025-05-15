import { formatDistanceToNow } from 'date-fns'

interface LastUpdatedProps {
  timestamp: string | Date
}

export function LastUpdated({ timestamp }: LastUpdatedProps) {
  const date = new Date(timestamp)
  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  return (
    <div className="text-sm text-slate-400">
      Last updated {timeAgo}
    </div>
  )
} 