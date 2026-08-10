const clientLogEndpoint = import.meta.env.VITE_CLIENT_LOG_ENDPOINT;

function toErrorDetails(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return { message: String(error) };
}

/**
 * Reports client failures without including request headers, tokens, or user data.
 * Configure VITE_CLIENT_LOG_ENDPOINT with an independent error collector so these
 * reports remain available when the Supabase stack is unavailable.
 */
export function reportClientError(message, context = {}, error) {
  const payload = {
    level: "error",
    message,
    context,
    error: error ? toErrorDetails(error) : undefined,
    url: `${window.location.origin}${window.location.pathname}`,
    timestamp: new Date().toISOString(),
  };

  console.error(`[iheardthis] ${message}`, payload);

  if (!clientLogEndpoint) {
    return;
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      clientLogEndpoint,
      new Blob([body], { type: "application/json" })
    );
    return;
  }

  fetch(clientLogEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // The browser console entry above is the fallback when the collector is down.
  });
}
