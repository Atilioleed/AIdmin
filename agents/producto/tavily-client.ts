// Cliente minimo para la API de busqueda de Tavily (https://api.tavily.com/search).
// Unico punto del proyecto que hace una llamada de red a una fuente externa real y
// no controlada - por eso el resultado SIEMPRE se envuelve con asUntrustedContent()
// en tools.ts antes de volver al modelo, nunca se pasa crudo.

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
}

export async function tavilySearch(query: string, maxResults = 5): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY no esta definida (revisa tu .env).');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, max_results: maxResults }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Tavily search fallo (${response.status}): ${body}`);
  }

  return (await response.json()) as TavilySearchResponse;
}
