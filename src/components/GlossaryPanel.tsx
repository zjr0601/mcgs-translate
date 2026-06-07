'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GlossaryEntry {
  zh: string;
  en: string;
  source: string;
  addedAt: number;
}

interface GlossaryPanelProps {
  entries: GlossaryEntry[];
  onUpdate: (zh: string, newEn: string) => void;
  onDelete: (zh: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const PAGE_SIZE = 50;

export function GlossaryPanel({
  entries,
  onUpdate,
  onDelete,
  onClear,
  onClose,
}: GlossaryPanelProps) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [editingZh, setEditingZh] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(
      (e) => e.zh.toLowerCase().includes(q) || e.en.toLowerCase().includes(q)
    );
  }, [entries, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageEntries = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">用户术语库管理</h2>
            <p className="text-sm text-gray-500">
              共 {entries.length} 条 · 自动记忆翻译
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ 关闭
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Input
            placeholder="搜索术语..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
            className="max-w-sm h-8 text-sm"
          />
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500">确认清空?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
              >
                确认清空
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmClear(false)}
              >
                取消
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-700 ml-auto"
              onClick={() => setConfirmClear(true)}
            >
              清空全部
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">中文</TableHead>
                <TableHead className="w-[40%]">英语</TableHead>
                <TableHead className="w-20">来源</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageEntries.map((e) => (
                <TableRow key={e.zh}>
                  <TableCell className="text-sm break-all">{e.zh}</TableCell>
                  <TableCell
                    className="text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setEditingZh(e.zh);
                      setEditValue(e.en);
                    }}
                  >
                    {editingZh === e.zh ? (
                      <Input
                        value={editValue}
                        onChange={(ev) => setEditValue(ev.target.value)}
                        onBlur={() => {
                          if (editValue !== e.en) onUpdate(e.zh, editValue);
                          setEditingZh(null);
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter') {
                            if (editValue !== e.en) onUpdate(e.zh, editValue);
                            setEditingZh(null);
                          }
                          if (ev.key === 'Escape') setEditingZh(null);
                        }}
                        autoFocus
                        className="h-7 text-sm"
                      />
                    ) : (
                      e.en
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {e.source === 'manual_edit' ? '手动' : '示例'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => onDelete(e.zh)}
                      className="text-gray-300 hover:text-red-500 text-xs"
                      title="删除"
                    >
                      ✕
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {pageEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    暂无术语
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-3 border-t">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30"
            >
              上一页
            </button>
            <span className="text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
