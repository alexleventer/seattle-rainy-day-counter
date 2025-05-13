'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface TemperatureTrendProps {
  trend: 'rising' | 'falling' | 'stable';
}

export function TemperatureTrend({ trend }: TemperatureTrendProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'rising':
        return <ArrowUp className="h-4 w-4 text-red-400" />;
      case 'falling':
        return <ArrowDown className="h-4 w-4 text-blue-400" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'rising':
        return 'Temperature rising';
      case 'falling':
        return 'Temperature falling';
      default:
        return 'Temperature stable';
    }
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      {getTrendIcon()}
      <span className="text-slate-400">{getTrendText()}</span>
    </div>
  );
} 