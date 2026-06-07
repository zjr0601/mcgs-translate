// DeepL API 封装 — 兜底翻译

export interface DeepLConfig {
  apiKey: string;
  freeApi?: boolean; // default: true (api-free.deepl.com)
}

const FREE_API_URL = 'https://api-free.deepl.com/v2/translate';
const PRO_API_URL = 'https://api.deepl.com/v2/translate';

/**
 * Translate a batch of texts using DeepL API.
 * DeepL free tier: 500,000 chars/month, api-free.deepl.com.
 * DeepL pro: api.deepl.com, supports glossaries.
 */
export async function translateWithDeepL(
  texts: string[],
  config: DeepLConfig
): Promise<string[]> {
  if (!config.apiKey) {
    throw new Error('DeepL API key not configured');
  }

  // Deduplicate texts to save API quota
  const uniqueTexts = [...new Set(texts)];

  const url = config.freeApi !== false ? FREE_API_URL : PRO_API_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `DeepL-Auth-Key ${config.apiKey}`,
    },
    body: JSON.stringify({
      text: uniqueTexts,
      source_lang: 'ZH',
      target_lang: 'EN-US',
      // DeepL Glossary requires Pro plan.
      // For Free plan, we rely on the built-in glossary for domain terms
      // and only send unmatched texts to DeepL.
      split_sentences: 'nonewlines',
      preserve_formatting: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const translatedMap = new Map<string, string>();
  for (let i = 0; i < uniqueTexts.length; i++) {
    translatedMap.set(uniqueTexts[i], data.translations[i].text);
  }

  // Return in original order (with duplicates)
  return texts.map((t) => translatedMap.get(t) || t);
}

/**
 * Estimate character count for DeepL quota tracking.
 */
export function estimateCharCount(texts: string[]): number {
  return texts.reduce((sum, t) => sum + t.length, 0);
}
