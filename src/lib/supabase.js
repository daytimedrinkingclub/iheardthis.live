import { createClient } from '@supabase/supabase-js';
import { reportClientError } from './clientDiagnostics';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const instrumentedFetch = async (input, init) => {
  const request = new Request(input, init);
  const startedAt = performance.now();
  const requestContext = {
    method: request.method,
    path: new URL(request.url).pathname,
  };

  try {
    const response = await fetch(request);

    if (!response.ok) {
      reportClientError("Supabase request returned an error response", {
        ...requestContext,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
      });
    }

    return response;
  } catch (error) {
    reportClientError(
      "Supabase request failed before a response was received",
      {
        ...requestContext,
        durationMs: Math.round(performance.now() - startedAt),
      },
      error
    );
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: instrumentedFetch },
});
