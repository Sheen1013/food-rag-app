'use client';

import { useState } from 'react';

interface Source {
  id: string;
  text: string;
  score: number;
}

interface Result {
  sources: Source[];
  answer: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍽️</div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Food RAG System</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0' }}>Ask anything about food — powered by AI + Vector Search</p>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
            🔍 Ask a food question
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. What foods are sweet and tropical?"
              style={{
                flex: 1, padding: '14px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '1rem', outline: 'none'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              style={{
                padding: '14px 28px', borderRadius: '10px', border: 'none',
                background: loading ? '#555' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff', fontWeight: 'bold', fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {loading ? '⏳ Searching...' : '🚀 Ask'}
            </button>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['What fruits are tropical?', 'Tell me about spicy foods', 'What foods are sweet?'].map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(245,87,108,0.15)', border: '1px solid rgba(245,87,108,0.4)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#f5576c' }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
            <p>Searching knowledge base and generating answer...</p>
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ color: '#f093fb', margin: '0 0 16px', fontSize: '1.1rem' }}>📚 Sources Found ({result.sources.length})</h2>
              {result.sources.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>No relevant sources found.</p>
              ) : (
                result.sources.map((src, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: '3px solid #f093fb' }}>
                    <p style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}>{src.text}</p>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Relevance: {(src.score * 100).toFixed(1)}%</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ color: '#f5576c', margin: '0 0 16px', fontSize: '1.1rem' }}>🤖 AI Response</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', margin: 0, fontSize: '1rem' }}>{result.answer}</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🥗</div>
            <p style={{ fontSize: '1.1rem' }}>Ask a question above to get started!</p>
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        Food RAG System — Built with Next.js, Upstash Vector & Groq
      </footer>
    </main>
  );
}
