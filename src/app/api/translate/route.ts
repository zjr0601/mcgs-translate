import { NextRequest, NextResponse } from 'next/server';
import { translateBatch, computeStats } from '@/lib/translator';
import { translateWithDeepL } from '@/lib/deepl';

interface TranslateRequestBody {
  entries: { id: number; zh: string }[];
  userGlossary?: { zh: string; en: string }[];
  deepLApiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequestBody = await request.json();

    if (!body.entries || !Array.isArray(body.entries)) {
      return NextResponse.json(
        { error: 'entries array is required' },
        { status: 400 }
      );
    }

    // Build user glossary map
    const userGlossary = new Map<string, string>();
    if (body.userGlossary) {
      for (const { zh, en } of body.userGlossary) {
        userGlossary.set(zh, en);
      }
    }

    // Run 3-layer engine
    const results = translateBatch(body.entries, userGlossary);

    // Collect entries that need DeepL
    const deepLNeeded = results.filter((r) => r.en === null && r.zh.trim());

    if (deepLNeeded.length > 0 && body.deepLApiKey) {
      try {
        const texts = deepLNeeded.map((r) => r.zh);
        const translations = await translateWithDeepL(texts, {
          apiKey: body.deepLApiKey,
        });

        for (let i = 0; i < deepLNeeded.length; i++) {
          deepLNeeded[i].en = translations[i];
          deepLNeeded[i].method = 'deepl';
          deepLNeeded[i].confidence = 0.6;
        }
      } catch (err) {
        console.error('DeepL translation failed:', err);
        // Leave DeepL entries as null — caller can retry or handle
      }
    }

    // Compute statistics
    const stats = computeStats(results);

    return NextResponse.json({
      results,
      stats,
      deepLRemaining: deepLNeeded.filter((r) => r.en === null).length,
    });
  } catch (err) {
    console.error('Translate API error:', err);
    return NextResponse.json(
      { error: 'Translation failed', details: String(err) },
      { status: 500 }
    );
  }
}
