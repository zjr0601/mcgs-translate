'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { FileDrop } from '@/components/FileDrop';
import { EditorTable } from '@/components/EditorTable';
import { StatsBar } from '@/components/StatsBar';
import { GlossaryPanel } from '@/components/GlossaryPanel';
import { parseXml, type XmlTextEntry } from '@/lib/parser';
import { generateXml, generateXmlBlob } from '@/lib/generate';
import { loadUserGlossary, loadUserGlossaryEntries, learnFromTranslatedXml, addUserTerm, deleteUserTerm, clearUserGlossary, importPairs, type UserTermEntry } from '@/lib/glossary';
import { translateBatch, computeStats, type TranslationStats, type BatchTranslateOutput } from '@/lib/translator';
import { translateWithDeepL } from '@/lib/deepl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  // File state
  const [originalXml, setOriginalXml] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [entries, setEntries] = useState<XmlTextEntry[]>([]);

  // Translation state
  const [translations, setTranslations] = useState<Map<number, string>>(new Map());
  const [results, setResults] = useState<BatchTranslateOutput[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // DeepL key
  const [deepLKey, setDeepLKey] = useState('');

  // Import mode (text → entries)
  const [importMode, setImportMode] = useState<'new' | 'append' | false>(false);
  const [importText, setImportText] = useState('');
  const [importDelim, setImportDelim] = useState<'newline' | 'semicolon'>('newline');
  const [importStartId, setImportStartId] = useState(0);
  const [importError, setImportError] = useState('');

  // User glossary
  const [userGlossary, setUserGlossary] = useState(() => {
    if (typeof window === 'undefined') return new Map<string, string>();
    return loadUserGlossary();
  });
  const [glossaryCount, setGlossaryCount] = useState(0);
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossaryEntries, setGlossaryEntries] = useState<UserTermEntry[]>([]);

  useEffect(() => {
    setGlossaryCount(loadUserGlossary().size);
    setGlossaryEntries(loadUserGlossaryEntries());
  }, []);

  // Generate a minimal XML skeleton from entries (for text import & download)
  const buildXml = useCallback((ents: XmlTextEntry[]): string => {
    const lines = ['<?xml version="1.0" encoding="utf-8"?>', '<root>'];
    for (const e of ents) {
      lines.push(`\t<文本 ID="${e.id}">`);
      lines.push(`\t\t<中文>${escapeXmlText(e.zh)}</中文>`);
      lines.push(`\t\t<英语/>`);
      lines.push(`\t</文本>`);
    }
    lines.push('</root>');
    return lines.join('\n');
  }, []);

  // Handle text import (create new OR append to existing)
  const handleTextImport = useCallback(() => {
    setImportError('');
    const text = importText.trim();
    if (!text) { setImportError('请输入文本'); return; }

    let lines: string[];
    if (importDelim === 'semicolon') {
      lines = text.split(/[;；]/).map(s => s.trim()).filter(Boolean);
    } else {
      lines = text.split(/\n\r?/).map(s => s.trim()).filter(Boolean);
    }

    if (lines.length === 0) { setImportError('未识别到有效文本'); return; }

    const appendMode = importMode === 'append' && originalXml;

    if (appendMode) {
      // Append to existing entries
      const maxId = entries.reduce((max, e) => Math.max(max, e.id), -1);
      const startId = Math.max(importStartId, maxId + 1);
      const newEntries: XmlTextEntry[] = lines.map((zh, i) => ({ id: startId + i, zh, en: '' }));
      // Update originalXml for download
      let xml = originalXml!;
      for (const e of newEntries) {
        xml = xml.replace('</root>', `\t<文本 ID="${e.id}">\n\t\t<中文>${escapeXmlText(e.zh)}</中文>\n\t\t<英语/>\n\t</文本>\n</root>`);
      }
      setOriginalXml(xml);
      setEntries(prev => [...prev, ...newEntries].sort((a, b) => a.id - b.id));
      setStats(null);
      // keep existing translations
    } else {
      const newEntries: XmlTextEntry[] = lines.map((zh, i) => ({ id: importStartId + i, zh, en: '' }));
      const xml = buildXml(newEntries);
      setOriginalXml(xml);
      setFileName('文本导入.xml');
      setEntries(newEntries);
      setTranslations(new Map());
      setResults([]);
      setStats(null);
    }

    setImportMode(false);
    setImportText('');
  }, [importText, importDelim, importStartId, importMode, originalXml, entries, buildXml]);

  // Handle file drop/select
  const handleFile = useCallback((xml: string, name: string) => {
    setOriginalXml(xml);
    setFileName(name);
    const parsed = parseXml(xml);
    setEntries(parsed);
    const existing = new Map<number, string>();
    for (const e of parsed) { if (e.en) existing.set(e.id, e.en); }
    setTranslations(existing);
    setResults([]);
    setStats(null);
  }, []);

  // Handle example file (learn mode) — main page
  const handleExampleFile = useCallback((xml: string) => {
    const parsed = parseXml(xml);
    const pairs = parsed.filter(e => e.zh && e.en).map(e => ({ zh: e.zh, en: e.en }));
    const learned = learnFromTranslatedXml(pairs);
    setUserGlossary(loadUserGlossary());
    setGlossaryCount(loadUserGlossary().size);
    alert(`Learned ${learned} new terms from example file.`);
  }, []);

  // Run translation (all client-side, no API needed)
  const handleTranslate = useCallback(async () => {
    if (!entries.length) return;
    setIsTranslating(true);
    const active = entries.filter(e => e.zh.trim());
    const inputs = active.map(e => ({ id: e.id, zh: e.zh }));

    // Run 3-layer engine directly in browser
    let batchResults = translateBatch(inputs, userGlossary);

    // Collect entries that need DeepL
    const deepLNeeded = batchResults.filter(r => r.en === null && r.zh.trim());
    if (deepLNeeded.length > 0 && deepLKey) {
      try {
        const texts = deepLNeeded.map(r => r.zh);
        const translations = await translateWithDeepL(texts, { apiKey: deepLKey });
        for (let i = 0; i < deepLNeeded.length; i++) {
          deepLNeeded[i].en = translations[i];
          deepLNeeded[i].method = 'deepl';
          deepLNeeded[i].confidence = 0.6;
        }
      } catch (err) { console.error('DeepL failed:', err); }
    }

    const stats = computeStats(batchResults);
    const newTrans = new Map(translations);
    for (const r of batchResults) { if (r.en) newTrans.set(r.id, r.en); }
    setTranslations(newTrans);
    setResults(batchResults);
    setStats(stats);
    setIsTranslating(false);
  }, [entries, translations, userGlossary, deepLKey]);

  const handleEdit = useCallback((id: number, newEn: string) => {
    const newTrans = new Map(translations); newTrans.set(id, newEn); setTranslations(newTrans);
    const entry = entries.find(e => e.id === id);
    if (entry?.zh) { addUserTerm(entry.zh, newEn); setUserGlossary(loadUserGlossary()); setGlossaryCount(loadUserGlossary().size); }
  }, [translations, entries]);

  const handleAdd = useCallback((id: number, zh: string) => {
    setEntries(prev => {
      if (prev.some(e => e.id === id)) return prev;
      return [...prev, { id, zh, en: '' }].sort((a, b) => a.id - b.id);
    });
    setTranslations(prev => { const n = new Map(prev); n.set(id, ''); return n; });
    // Also update the XML skeleton so download works
    setOriginalXml(prev => prev ? regenerateXml(prev, id, zh) : prev);
  }, []);

  const handleChangeId = useCallback((oldId: number, newId: number) => {
    setEntries(prev => prev.map(e => e.id === oldId ? { ...e, id: newId } : e));
    setTranslations(prev => { const n = new Map(prev); const v = n.get(oldId); n.delete(oldId); if (v !== undefined) n.set(newId, v); return n; });
  }, []);

  const handleDelete = useCallback((id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setTranslations(prev => { const n = new Map(prev); n.delete(id); return n; });
  }, []);

  const handleGlossaryUpdate = useCallback((zh: string, newEn: string) => {
    addUserTerm(zh, newEn); setUserGlossary(loadUserGlossary()); setGlossaryCount(loadUserGlossary().size); setGlossaryEntries(loadUserGlossaryEntries());
  }, []);
  const handleGlossaryDelete = useCallback((zh: string) => {
    deleteUserTerm(zh); setUserGlossary(loadUserGlossary()); setGlossaryCount(loadUserGlossary().size); setGlossaryEntries(loadUserGlossaryEntries());
  }, []);
  const handleGlossaryClear = useCallback(() => {
    clearUserGlossary(); setUserGlossary(loadUserGlossary()); setGlossaryCount(0); setGlossaryEntries([]);
  }, []);
  const handleGlossaryImportXml = useCallback((xml: string) => {
    const parsed = parseXml(xml);
    const pairs = parsed.filter(e => e.zh && e.en).map(e => ({ zh: e.zh, en: e.en }));
    const n = importPairs(pairs, 'import_file');
    setUserGlossary(loadUserGlossary()); setGlossaryCount(loadUserGlossary().size); setGlossaryEntries(loadUserGlossaryEntries());
    return n;
  }, []);
  const handleGlossaryImport = useCallback((pairs: { zh: string; en: string }[]) => {
    const n = importPairs(pairs, 'import_paste');
    setUserGlossary(loadUserGlossary()); setGlossaryCount(loadUserGlossary().size); setGlossaryEntries(loadUserGlossaryEntries());
    return n;
  }, []);

  // Download
  const handleDownload = useCallback(() => {
    let xml: string;
    if (originalXml?.startsWith('<?xml')) {
      // From file upload: use original XML as template
      xml = generateXml(originalXml, entries, translations);
    } else {
      // From text import: rebuild XML from entries
      xml = buildXml(entries);
      // Patch in translations
      for (const [id, en] of translations) {
        xml = xml.replace(new RegExp(`<文本 ID="${id}">([\\s\\S]*?)<英语/>`), (m, g1) => m.replace('<英语/>', `<英语>${escapeXmlText(en)}</英语>`));
      }
    }
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName || '工程多语言信息.xml'; a.click(); URL.revokeObjectURL(url);
  }, [originalXml, entries, translations, fileName, buildXml]);

  const activeEntries = useMemo(() => entries.filter(e => e.zh.trim()), [entries]);

  const hasData = originalXml && activeEntries.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MCGS 多语言翻译</h1>
          <p className="text-sm text-gray-500 mt-1">
            HMI 中→英翻译 · 内置元器件拼接术语库 ·{' '}
            <button className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
              onClick={() => { setGlossaryEntries(loadUserGlossaryEntries()); setShowGlossary(true); }}>
              用户术语 {glossaryCount} 条
            </button>
          </p>
        </header>

        {/* Upload area */}
        {!originalXml && !importMode && (
          <div className="space-y-4">
            <FileDrop onFile={handleFile} accept=".xml" label="拖拽 工程多语言信息.xml 到此处，或点击上传" />
            <div className="text-center text-sm text-gray-400">或</div>
            <FileDrop onFile={handleExampleFile} accept=".xml" label="上传示例文件学习术语" variant="secondary" />
            <div className="text-center text-sm text-gray-400">或</div>
            <div className="text-center">
              <Button variant="outline" onClick={() => { setImportMode('new'); setImportStartId(0); }}>从文本创建新文件</Button>
            </div>
          </div>
        )}

        {/* Text import modal */}
        {importMode && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-medium text-gray-900">
              {importMode === 'append' ? '从文本追加条目' : '从文本创建新文件'}
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600">起始ID:</label>
              <Input value={String(importStartId)} onChange={e => setImportStartId(parseInt(e.target.value) || 0)} className="w-24 h-8 text-sm" />
              <label className="text-sm text-gray-600">分隔:</label>
              <select value={importDelim} onChange={e => setImportDelim(e.target.value as 'newline'|'semicolon')}
                className="border rounded px-2 py-1 text-sm">
                <option value="newline">换行</option>
                <option value="semicolon">分号 (;)</option>
              </select>
            </div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="粘贴中文文本，每行一条或用分号分隔&#10;例如：&#10;系统自动运行&#10;系统停止按钮&#10;急停&#10;...&#10;&#10;或分号格式：&#10;系统自动运行;系统停止按钮;急停"
              className="w-full h-64 border rounded-lg p-3 text-sm font-mono resize-y"
            />
            {importText && (
              <p className="text-sm text-gray-500">
                将生成 {(importDelim==='semicolon'?importText.split(/[;；]/):importText.split(/\n\r?/)).filter(s=>s.trim()).length} 条，ID {importStartId}~
                {importStartId+(importDelim==='semicolon'?importText.split(/[;；]/):importText.split(/\n\r?/)).filter(s=>s.trim()).length-1}
              </p>
            )}
            {importError && <p className="text-sm text-red-500">{importError}</p>}
            <div className="flex gap-3">
              <Button onClick={handleTextImport}>导入</Button>
              <Button variant="ghost" onClick={() => { setImportMode(false); setImportText(''); setImportError(''); }}>取消</Button>
            </div>
          </div>
        )}

        {/* DeepL + Actions */}
        {hasData && (
          <div className="mb-6 space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">DeepL API Key（可选）</label>
                <Input type="password" placeholder="留空则仅用术语库翻译" value={deepLKey} onChange={e => setDeepLKey(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleTranslate} disabled={isTranslating}>{isTranslating ? '翻译中...' : '全部翻译'}</Button>
                <Button variant="outline" onClick={handleDownload}>下载 XML</Button>
                <Button variant="outline" onClick={() => {
                  const maxId = entries.reduce((m, e) => Math.max(m, e.id), -1);
                  setImportStartId(maxId + 1);
                  setImportMode('append');
                }}>从文本追加</Button>
              </div>
            </div>
            <StatsBar total={activeEntries.length} stats={stats} glossaryCount={glossaryCount} />
          </div>
        )}

        {/* Editor Table */}
        {hasData && (
          <EditorTable entries={activeEntries} translations={translations} results={results}
            onEdit={handleEdit} onAdd={handleAdd} onChangeId={handleChangeId} onDelete={handleDelete} />
        )}

        {originalXml && activeEntries.length === 0 && (
          <div className="text-center text-gray-400 py-12">文件中没有有效中文条目</div>
        )}
      </div>

      {showGlossary && (
        <GlossaryPanel entries={glossaryEntries} onUpdate={handleGlossaryUpdate}
          onDelete={handleGlossaryDelete} onClear={handleGlossaryClear} onImport={handleGlossaryImport}
          onImportXml={handleGlossaryImportXml} onClose={() => setShowGlossary(false)} />
      )}
    </main>
  );
}

function escapeXmlText(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function regenerateXml(prev: string, newId: number, zh: string): string {
  // Insert new entry before </root>
  const entry = `\t<文本 ID="${newId}">\n\t\t<中文>${escapeXmlText(zh)}</中文>\n\t\t<英语/>\n\t</文本>\n`;
  return prev.replace('</root>', entry + '</root>');
}
