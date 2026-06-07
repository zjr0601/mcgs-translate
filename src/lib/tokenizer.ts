// 中文分词器 — 从命名规范可知，中文名称是"设备前缀+功能+位置"的拼接
// 分词策略：从 tokens 表做最长前缀匹配，贪心拆分

import { TOKEN_ZH_TO_EN } from '@/data/tokens';
import { FIXED_PHRASE_MAP } from '@/data/fixed-phrases';

export interface TokenMatch {
  zh: string;
  en: string | null;
  found: boolean;
}

/**
 * Tokenize a Chinese device name string by greedy longest-prefix matching.
 * Also handles placeholder preservation ({OV}, {CV}).
 */
export function tokenize(zh: string): TokenMatch[] {
  const result: TokenMatch[] = [];
  let remaining = zh;

  while (remaining.length > 0) {
    // Check for placeholders {OV}, {CV}
    const placeholderMatch = remaining.match(/^(\{[A-Z]+\})/);
    if (placeholderMatch) {
      const ph = placeholderMatch[1];
      result.push({ zh: ph, en: ph, found: true });
      remaining = remaining.slice(ph.length);
      continue;
    }

    // Check for colon / arrow separators
    const sepMatch = remaining.match(/^([：:]|-->|--)/);
    if (sepMatch) {
      const sep = sepMatch[1];
      // Map Chinese colon to English colon
      const enSep = sep === '：' ? ':' : sep;
      result.push({ zh: sep, en: enSep, found: true });
      remaining = remaining.slice(sep.length);
      continue;
    }

    // Longest prefix match against token table
    let matched = false;
    for (const [zhToken, enToken] of TOKEN_ZH_TO_EN) {
      if (remaining.startsWith(zhToken)) {
        result.push({ zh: zhToken, en: enToken, found: true });
        remaining = remaining.slice(zhToken.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Single character fallback - try to eat one char
      // (numbers, punctuation, unmatched Chinese chars)
      const ch = remaining[0];
      result.push({ zh: ch, en: ch, found: false });
      remaining = remaining.slice(1);
    }
  }

  return result;
}

/**
 * Check if a string can be fully tokenized (all tokens found).
 */
export function isFullyTokenized(zh: string): boolean {
  // First check if it's a placeholder pattern
  if (/^\{[A-Z]+\}$/.test(zh)) return true;

  const tokens = tokenize(zh);
  return tokens.length > 0 && tokens.every((t) => t.found);
}

/**
 * Splice tokenized parts into English with underscore joining.
 * Unmatched parts are returned as-is (will fall through to DeepL).
 */
export function spliceTokens(zh: string): string | null {
  const tokens = tokenize(zh);
  if (tokens.length === 0) return null;

  const allFound = tokens.every((t) => t.found);
  if (!allFound) return null;

  // Filter out separators and empty parts from the join.
  // Collapse multiple underscores from token concatenation.
  const enParts = tokens
    .filter((t) => t.zh !== '：' && t.zh !== ':' && t.zh !== '-->' && t.zh !== '--')
    .map((t) => t.en!)
    .filter(Boolean);

  if (enParts.length === 0) return null;
  let result = enParts.join('_');
  result = result.replace(/_+/g, '_').replace(/_$/, '').replace(/^_/, '');
  return result || null;
}
