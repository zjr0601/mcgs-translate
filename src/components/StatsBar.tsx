'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { TranslationStats } from '@/lib/translator';

interface StatsBarProps {
  total: number;
  stats: TranslationStats | null;
  glossaryCount: number;
}

export function StatsBar({ total, stats, glossaryCount }: StatsBarProps) {
  if (!stats) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            共 <strong>{total}</strong> 条
          </span>
          <span>
            用户术语库: <strong>{glossaryCount}</strong> 条
          </span>
          <span className="text-gray-400">点击"全部翻译"开始</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-gray-900">共 {stats.total} 条</span>

        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
          术语命中 {stats.fixed}
        </Badge>

        <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
          规则拼接 {stats.splice}
        </Badge>

        <Badge variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50">
          Token拼接 {stats.token}
        </Badge>

        {stats.user > 0 && (
          <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
            用户术语 {stats.user}
          </Badge>
        )}

        <Badge
          variant="outline"
          className={
            stats.deepl > 0
              ? 'text-orange-700 border-orange-300 bg-orange-50'
              : 'text-gray-400 border-gray-200'
          }
        >
          DeepL {stats.deepl}
        </Badge>

        <span className="ml-auto font-semibold text-gray-900">
          命中率: {(stats.hitRate * 100).toFixed(1)}%
        </span>
      </div>

      <Progress
        value={stats.hitRate * 100}
        className="h-2"
      />
    </Card>
  );
}
