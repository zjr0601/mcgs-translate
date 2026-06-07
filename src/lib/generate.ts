// XML 生成器 — 将翻译结果写回 MCGS 工程多语言信息.xml
// 用字符串替换，不动 XML 其他部分，保持格式不变

import { XmlTextEntry } from './parser';

/**
 * Generate translated XML by replacing English tags in-place.
 * Strategy: for each entry, find the original <英语>...</英语> block
 * and replace only its content. Self-closing <英语/> blocks are left alone
 * unless they have zh content (empty zh → empty tag, no translation needed).
 */
export function generateXml(
  originalXml: string,
  entries: XmlTextEntry[],
  translations: Map<number, string> // id → new English text
): string {
  let result = originalXml;

  for (const entry of entries) {
    const newEn = translations.get(entry.id);
    if (newEn === undefined) continue; // nothing to change for this entry

    // Find the exact <英语>...</英语> or <英语/> block for this entry
    // We search for the block by matching the ID context
    const idStr = entry.id.toString();

    // Build a regex that finds the specific entry block
    const blockStart = `<文本 ID="${idStr}">`;
    const idx = result.indexOf(blockStart);
    if (idx === -1) continue;

    // Find the closing </文本> from this position
    const blockEnd = result.indexOf('</文本>', idx);
    if (blockEnd === -1) continue;

    const block = result.substring(idx, blockEnd + '</文本>'.length);

    // Check if <英语/> self-closing
    if (block.includes('<英语/>')) {
      // Self-closing — if newEn is empty, leave as-is; otherwise expand
      if (newEn) {
        const newBlock = block.replace('<英语/>', `<英语>${escapeXml(newEn)}</英语>`);
        result = result.replace(block, newBlock);
      }
      continue;
    }

    // Check if <英语>...</英语> exists
    const enTagRegex = /<英语>([\s\S]*?)<\/英语>/;
    const enMatch = block.match(enTagRegex);
    if (enMatch) {
      const newBlock = block.replace(
        enMatch[0],
        `<英语>${escapeXml(newEn)}</英语>`
      );
      result = result.replace(block, newBlock);
    }
  }

  return result;
}

/**
 * Escape special XML characters in text content.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a downloadable XML blob from original + translations.
 */
export function generateXmlBlob(
  originalXml: string,
  entries: XmlTextEntry[],
  translations: Map<number, string>
): Blob {
  const xml = generateXml(originalXml, entries, translations);
  return new Blob([xml], { type: 'application/xml;charset=utf-8' });
}
