'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
  onImport: (pairs: { zh: string; en: string }[]) => number;
}

const PAGE_SIZE = 50;

export function GlossaryPanel({
  entries, onUpdate, onDelete, onClear, onClose, onImport,
}: GlossaryPanelProps) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [editingZh, setEditingZh] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(e => e.zh.toLowerCase().includes(q) || e.en.toLowerCase().includes(q));
  }, [entries, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageEntries = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Parse text pairs: supports "zh=en", "zh = en", "zh\ten", "zh\t en", "zh   en"
  const handlePasteImport = useCallback(() => {
    setImportMsg('');
    const lines = importText.split(/\n\r?/).map(s => s.trim()).filter(Boolean);
    const pairs: { zh: string; en: string }[] = [];

    for (const line of lines) {
      let zh = '', en = '';
      // Try "=" separator
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        zh = line.substring(0, eqIdx).trim();
        en = line.substring(eqIdx + 1).trim();
      } else {
        // Try tab or multiple spaces
        const tabIdx = line.search(/\t| {2,}/);
        if (tabIdx > 0) {
          zh = line.substring(0, tabIdx).trim();
          en = line.substring(tabIdx).trim();
        } else {
          // Single space: split on first space
          const spIdx = line.indexOf(' ');
          if (spIdx > 0) {
            zh = line.substring(0, spIdx).trim();
            en = line.substring(spIdx + 1).trim();
          }
        }
      }
      if (zh && en) pairs.push({ zh, en });
    }

    if (pairs.length === 0) { setImportMsg('未识别到有效对照。格式: 中文=English 或 中文\tEnglish'); return; }
    const n = onImport(pairs);
    setImportMsg(`已导入 ${n} 条新术语（共 ${pairs.length} 条，跳过 ${pairs.length - n} 条重复）`);
    setImportText('');
  }, [importText, onImport]);

  // Handle file upload (TSV/CSV)
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\n\r?/).map(s => s.trim()).filter(Boolean);
      const pairs: { zh: string; en: string }[] = [];
      for (const line of lines) {
        // TSV: tab separated
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const zh = parts[0].trim();
          const en = parts[1].trim();
          if (zh && en) pairs.push({ zh, en });
        }
      }
      if (pairs.length > 0) {
        const n = onImport(pairs);
        setImportMsg(`从文件导入 ${n} 条新术语（共 ${pairs.length} 条）`);
      }
    };
    reader.readAsText(file, 'utf-8');
    if (fileRef.current) fileRef.current.value = '';
  }, [onImport]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">用户术语库管理</h2>
            <p className="text-sm text-gray-500">共 {entries.length} 条</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕ 关闭</Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-wrap">
          <Input placeholder="搜索术语..." value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0); }}
            className="max-w-sm h-8 text-sm" />
          <Button size="sm" variant="outline"
            onClick={() => setShowImport(!showImport)}>
            {showImport ? '收起导入' : '导入术语'}
          </Button>
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500">确认清空?</span>
              <Button size="sm" variant="destructive" onClick={() => { onClear(); setConfirmClear(false); }}>确认清空</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>取消</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 ml-auto"
              onClick={() => setConfirmClear(true)}>清空全部</Button>
          )}
        </div>

        {/* Import section */}
        {showImport && (
          <div className="px-4 py-3 border-b bg-gray-50 space-y-3">
            <p className="text-sm font-medium text-gray-700">导入术语对照</p>
            <div className="flex gap-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                上传文件 (TSV/CSV)
              </Button>
              <input ref={fileRef} type="file" accept=".tsv,.csv,.txt" onChange={handleFileImport} className="hidden" />
              <span className="text-xs text-gray-400 self-center">支持 tab 分隔、逗号分隔的文本文件</span>
            </div>
            <p className="text-xs text-gray-500">
              或直接粘贴对照文本（每行一条：中文=English 或 中文 Tab English）：
            </p>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={"系统自动运行=System_Running\n急停=EMO\n备用=Spare\n..."}
              className="w-full h-24 border rounded p-2 text-sm font-mono resize-y" />
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handlePasteImport}>导入</Button>
              {importMsg && <span className="text-sm text-green-600">{importMsg}</span>}
            </div>
          </div>
        )}

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
                  <TableCell className="text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => { setEditingZh(e.zh); setEditValue(e.en); }}>
                    {editingZh === e.zh ? (
                      <Input value={editValue} onChange={ev => setEditValue(ev.target.value)}
                        onBlur={() => { if (editValue !== e.en) onUpdate(e.zh, editValue); setEditingZh(null); }}
                        onKeyDown={ev => {
                          if (ev.key === 'Enter') { if (editValue !== e.en) onUpdate(e.zh, editValue); setEditingZh(null); }
                          if (ev.key === 'Escape') setEditingZh(null);
                        }} autoFocus className="h-7 text-sm" />
                    ) : e.en}
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {e.source === 'manual_edit' ? '手动' : e.source === 'import_paste' ? '粘贴' : e.source === 'import_file' ? '文件' : '示例'}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => onDelete(e.zh)} className="text-gray-300 hover:text-red-500 text-xs" title="删除">✕</button>
                  </TableCell>
                </TableRow>
              ))}
              {pageEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">暂无术语</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-3 border-t">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30">上一页</button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30">下一页</button>
          </div>
        )}
      </div>
    </div>
  );
}
