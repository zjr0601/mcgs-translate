'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { XmlTextEntry } from '@/lib/parser';
import type { BatchTranslateOutput } from '@/lib/translator';

interface EditorTableProps {
  entries: XmlTextEntry[];
  translations: Map<number, string>;
  results: BatchTranslateOutput[];
  onEdit: (id: number, newEn: string) => void;
  onAdd: (id: number, zh: string) => void;
  onChangeId: (oldId: number, newId: number) => void;
  onDelete: (id: number) => void;
}

const PAGE_SIZE = 100;

export function EditorTable({
  entries,
  translations,
  results,
  onEdit,
  onAdd,
  onChangeId,
  onDelete,
}: EditorTableProps) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // ID editing
  const [editingIdField, setEditingIdField] = useState<number | null>(null);
  const [editIdValue, setEditIdValue] = useState('');

  // New row state
  const [newRowId, setNewRowId] = useState('');
  const [newRowZh, setNewRowZh] = useState('');

  // Build a lookup from results
  const resultMap = useMemo(() => {
    const map = new Map<number, BatchTranslateOutput>();
    for (const r of results) map.set(r.id, r);
    return map;
  }, [results]);

  // Filtered entries
  const filtered = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(
      (e) =>
        e.zh.toLowerCase().includes(q) ||
        (translations.get(e.id) || '').toLowerCase().includes(q)
    );
  }, [entries, filter, translations]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageEntries = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const startEdit = useCallback(
    (id: number) => {
      setEditingId(id);
      setEditValue(translations.get(id) || '');
    },
    [translations]
  );

  const commitEdit = useCallback(
    (id: number) => {
      if (editingId === id) {
        onEdit(id, editValue);
        setEditingId(null);
      }
    },
    [editingId, editValue, onEdit]
  );

  const startIdEdit = useCallback((id: number) => {
    setEditingIdField(id);
    setEditIdValue(String(id));
  }, []);

  const commitIdEdit = useCallback(
    (oldId: number) => {
      const newId = parseInt(editIdValue, 10);
      if (!isNaN(newId) && newId !== oldId) {
        onChangeId(oldId, newId);
      }
      setEditingIdField(null);
    },
    [editIdValue, onChangeId]
  );

  const handleAdd = useCallback(() => {
    const id = parseInt(newRowId, 10);
    if (!isNaN(id) && newRowZh.trim()) {
      onAdd(id, newRowZh.trim());
      setNewRowId('');
      setNewRowZh('');
    }
  }, [newRowId, newRowZh, onAdd]);

  const getMethodBadge = (id: number) => {
    const r = resultMap.get(id);
    if (!r) {
      const en = translations.get(id);
      return en ? (
        <Badge variant="outline" className="text-xs text-gray-400">
          已有
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs text-gray-300">
          待翻译
        </Badge>
      );
    }

    switch (r.method) {
      case 'user':
        return (
          <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300">
            用户术语
          </Badge>
        );
      case 'fixed':
        return (
          <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
            术语命中
          </Badge>
        );
      case 'splice':
        return (
          <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-300">
            规则拼接
          </Badge>
        );
      case 'token':
        return (
          <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300">
            Token拼接
          </Badge>
        );
      case 'deepl':
        return (
          <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300">
            DeepL
          </Badge>
        );
      default:
        return (
          <Badge className="text-xs bg-red-50 text-red-500 border-red-200">
            未翻译
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="搜索中文或英文..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <span className="text-sm text-gray-500">
          显示 {filtered.length} / {entries.length} 条
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Scroll to bottom where the add row is
            const el = document.getElementById('add-row');
            el?.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('new-id')?.focus();
          }}
        >
          + 新建行
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="w-[40%]">中文</TableHead>
              <TableHead className="w-[40%]">英语</TableHead>
              <TableHead className="w-24">来源</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageEntries.map((entry) => {
              const en = translations.get(entry.id) || '';
              const isEditing = editingId === entry.id;
              const isEditingId = editingIdField === entry.id;

              return (
                <TableRow key={entry.id}>
                  <TableCell
                    className="text-xs text-gray-400 cursor-pointer hover:bg-gray-100"
                    onClick={() => startIdEdit(entry.id)}
                  >
                    {isEditingId ? (
                      <Input
                        value={editIdValue}
                        onChange={(e) => setEditIdValue(e.target.value)}
                        onBlur={() => commitIdEdit(entry.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitIdEdit(entry.id);
                          if (e.key === 'Escape') setEditingIdField(null);
                        }}
                        autoFocus
                        className="h-7 text-xs w-20"
                      />
                    ) : (
                      entry.id
                    )}
                  </TableCell>
                  <TableCell className="text-sm break-all">
                    {entry.zh}
                  </TableCell>
                  <TableCell
                    className="text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => startEdit(entry.id)}
                  >
                    {isEditing ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(entry.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(entry.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="h-8 text-sm"
                      />
                    ) : (
                      <span
                        className={en ? 'text-gray-900' : 'text-gray-300 italic'}
                      >
                        {en || '点击编辑'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getMethodBadge(entry.id)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-gray-300 hover:text-red-500 text-xs"
                      title="删除此行"
                    >
                      ✕
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Row */}
      <div
        id="add-row"
        className="border rounded-lg bg-white p-3 flex items-center gap-3"
      >
        <Input
          id="new-id"
          placeholder="ID"
          value={newRowId}
          onChange={(e) => setNewRowId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') document.getElementById('new-zh')?.focus();
          }}
          className="w-20 h-8 text-sm"
        />
        <Input
          id="new-zh"
          placeholder="中文"
          value={newRowZh}
          onChange={(e) => setNewRowZh(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          className="flex-1 h-8 text-sm"
        />
        <Button size="sm" onClick={handleAdd}>
          添加
        </Button>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
  );
}
