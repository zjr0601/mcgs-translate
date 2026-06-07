// XML 解析器 — 读取 MCGS 工程多语言信息.xml
// 兼容两种格式:
//   标准: <中文>文本</中文> <英语>text</英语>
//   自闭合: <中文/> <英语/>
//   跨行: <英语>line1\nline2</英语>

export interface XmlTextEntry {
  id: number;
  zh: string;
  en: string;
}

/**
 * Parse MCGS multi-language XML content.
 * Handles <中文/>, <英语/> self-closing tags and multiline content.
 */
export function parseXml(xmlContent: string): XmlTextEntry[] {
  const entries: XmlTextEntry[] = [];

  // Match each <文本 ID="N">...</文本> block
  // Using [\s\S] to match across lines
  const blockRegex = /<文本 ID="(\d+)">([\s\S]*?)<\/文本>/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xmlContent)) !== null) {
    const id = parseInt(match[1], 10);
    const inner = match[2];

    // Extract Chinese text
    let zh = '';
    const zhSelfClose = inner.match(/<中文\s*\/>/);
    const zhTag = inner.match(/<中文>([\s\S]*?)<\/中文>/);

    if (!zhSelfClose && zhTag) {
      zh = zhTag[1].trim();
    }
    // Self-closing <中文/> → empty string

    // Extract English text
    let en = '';
    const enSelfClose = inner.match(/<英语\s*\/>/);
    const enTag = inner.match(/<英语>([\s\S]*?)<\/英语>/);

    if (!enSelfClose && enTag) {
      en = enTag[1].trim();
    }

    entries.push({ id, zh, en });
  }

  return entries;
}

/**
 * Count entries with non-empty Chinese text (skip <中文/> self-closing).
 */
export function countActiveEntries(entries: XmlTextEntry[]): number {
  return entries.filter((e) => e.zh.length > 0).length;
}

/**
 * Extract unique Chinese text strings from parsed entries.
 */
export function getUniqueChinese(entries: XmlTextEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    if (e.zh && !map.has(e.zh)) {
      map.set(e.zh, e.id);
    }
  }
  return map;
}
