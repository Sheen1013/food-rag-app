import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

async function getEmbedding(text: string): Promise<number[]> {
  const embedding = new Array(768).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * (i + 1) * (j + 1)) % 768;
      embedding[idx] += 1 / (words.length * word.length);
    }
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const queryEmbedding = await getEmbedding(query);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    const sources = searchResults.map((r) => ({
      id: String(r.id),
      text: (r.metadata as Record<string, string>)?.text || String(r.id),
      score: r.score,
    }));

    const context = sources.length > 0
      ? sources.map((s) => s.text).join('\n')
      : 'No specific food information found in the database.';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful food expert assistant. Answer questions based on the provided food knowledge context. Be informative, friendly, and concise.',
        },
        {
          role: 'user',
          content: `Context from food knowledge base:\n${context}\n\nQuestion: ${query}\n\nPlease answer based on the context provided.`,
        },
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
