import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    const searchResults = await index.query({
      data: query,
      topK: 3,
      includeMetadata: true,
    });
    const sources = searchResults.map((r) => ({
      id: String(r.id),
      text: (r.metadata as Record<string, string>)?.text || '',
      score: r.score,
    }));
    const context = sources.length > 0
      ? sources.map((s) => s.text).join('\n')
      : 'No specific food information found.';
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helpful food expert. Answer based on the context provided.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    const answer = completion.choices[0]?.message?.content || 'No answer generated.';
    return NextResponse.json({ sources, answer });
  } catch (error: unknown) {
    console.error('RAG error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
