import { NextRequest, NextResponse } from 'next/server';

interface LearnRequestBody {
  pairs: { zh: string; en: string }[];
}

/**
 * Learn from user-provided translation pairs (extracted from example XML).
 * Returns the learned pairs so the client can store them in localStorage.
 */
export async function POST(request: NextRequest) {
  try {
    const body: LearnRequestBody = await request.json();

    if (!body.pairs || !Array.isArray(body.pairs)) {
      return NextResponse.json(
        { error: 'pairs array is required' },
        { status: 400 }
      );
    }

    // Deduplicate and filter empty entries
    const seen = new Set<string>();
    const learned: { zh: string; en: string }[] = [];

    for (const { zh, en } of body.pairs) {
      if (!zh || !en || seen.has(zh)) continue;
      seen.add(zh);
      learned.push({ zh, en });
    }

    return NextResponse.json({
      learned: learned.length,
      pairs: learned,
    });
  } catch (err) {
    console.error('Learn API error:', err);
    return NextResponse.json(
      { error: 'Learning failed', details: String(err) },
      { status: 500 }
    );
  }
}
