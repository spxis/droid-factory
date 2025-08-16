import { describe, it, expect } from 'vitest';

const DEFAULT_SWAPI = 'https://swapi-graphql.netlify.app/graphql';

async function runQuery(query: string, variables?: Record<string, unknown>) {
  const endpoint = process.env.VITE_SWAPI_GRAPHQL_URL || DEFAULT_SWAPI;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

describe('SWAPI GraphQL connectivity', () => {
  it('can fetch allFilms totalCount', async () => {
    const query = /* GraphQL */ `
      query TestAllFilms { allFilms { totalCount } }
    `;
    const data = await runQuery(query);
    expect(data?.allFilms?.totalCount).toBeGreaterThan(0);
  });
});
