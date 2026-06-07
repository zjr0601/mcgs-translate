// 翻译引擎 — 3 层匹配 + DeepL 兜底
//
// Layer 3: 固定短语精确匹配
// Layer 2: 模式匹配 + Token 拼接 (rules.ts)
// Layer 1: 原子 Token 最长匹配拼接 (tokenizer.ts)
// Fallback: DeepL API

import { FIXED_PHRASE_MAP } from '@/data/fixed-phrases';
import { RULES, spliceByTokens } from '@/data/rules';
import { spliceTokens } from './tokenizer';

export type TranslationMethod = 'user' | 'fixed' | 'splice' | 'token' | 'deepl' | 'manual' | null;

export interface TranslationResult {
  en: string | null; // null = needs DeepL
  method: TranslationMethod;
  confidence: number; // 0-1
  matchedRule?: string; // which splice rule matched (for stats)
}

export interface BatchTranslateInput {
  id: number;
  zh: string;
}

export interface BatchTranslateOutput {
  id: number;
  zh: string;
  en: string | null;
  method: TranslationMethod;
  confidence: number;
  matchedRule?: string;
}

/**
 * Translate a single Chinese text through the 3-layer engine.
 * Returns null for `en` if DeepL fallback is needed.
 */
export function translateOne(
  zh: string,
  userGlossary?: Map<string, string>
): TranslationResult {
  // Skip empty / whitespace-only
  if (!zh || zh.trim() === '') {
    return { en: '', method: null, confidence: 1 };
  }

  // 0. Check user glossary (highest priority)
  if (userGlossary?.has(zh)) {
    return { en: userGlossary.get(zh)!, method: 'user', confidence: 1 };
  }

  // 1. Layer 3: Fixed phrase exact match
  if (FIXED_PHRASE_MAP.has(zh)) {
    return { en: FIXED_PHRASE_MAP.get(zh)!, method: 'fixed', confidence: 1 };
  }

  // 2. Layer 2: Pattern match + splice rules
  for (const rule of RULES) {
    const m = zh.match(rule.pattern);
    if (m) {
      const en = rule.apply(m);
      if (en) {
        return { en, method: 'splice', confidence: 0.9, matchedRule: rule.name };
      }
    }
  }

  // 3. Layer 1: Token-based greedy splicing
  const tokenResult = spliceTokens(zh);
  if (tokenResult) {
    return { en: tokenResult, method: 'token', confidence: 0.7 };
  }

  // 4. Fallback: needs DeepL
  return { en: null, method: null, confidence: 0 };
}

/**
 * Translate a batch of entries using the 3-layer engine.
 * Entries that can't be matched are returned with en=null for DeepL processing.
 */
export function translateBatch(
  entries: BatchTranslateInput[],
  userGlossary?: Map<string, string>
): BatchTranslateOutput[] {
  return entries.map((e) => {
    const result = translateOne(e.zh, userGlossary);
    return {
      id: e.id,
      zh: e.zh,
      en: result.en,
      method: result.method,
      confidence: result.confidence,
      matchedRule: result.matchedRule,
    };
  });
}

/**
 * Compute hit-rate statistics for a batch translation result.
 */
export interface TranslationStats {
  total: number;
  user: number;
  fixed: number;
  splice: number;
  token: number;
  deepl: number; // count of items that need DeepL
  manual: number;
  hitRate: number; // (user+fixed+splice+token) / total
  ruleBreakdown: Record<string, number>; // per-rule counts
}

export function computeStats(results: BatchTranslateOutput[]): TranslationStats {
  const stats: TranslationStats = {
    total: results.length,
    user: 0,
    fixed: 0,
    splice: 0,
    token: 0,
    deepl: 0,
    manual: 0,
    hitRate: 0,
    ruleBreakdown: {},
  };

  for (const r of results) {
    switch (r.method) {
      case 'user':
        stats.user++;
        break;
      case 'fixed':
        stats.fixed++;
        break;
      case 'splice':
        stats.splice++;
        if (r.matchedRule) {
          stats.ruleBreakdown[r.matchedRule] =
            (stats.ruleBreakdown[r.matchedRule] || 0) + 1;
        }
        break;
      case 'token':
        stats.token++;
        break;
      case 'manual':
        stats.manual++;
        break;
      default:
        stats.deepl++;
        break;
    }
  }

  const hit = stats.user + stats.fixed + stats.splice + stats.token;
  stats.hitRate = stats.total > 0 ? hit / stats.total : 0;
  return stats;
}
