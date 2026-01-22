/**
 * HTTP request utilities
 */

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  latency_ms: number;
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Make an HTTP request and return structured response
 */
export async function makeRequest(
  url: string,
  options: HttpRequestOptions = {}
): Promise<HttpResponse> {
  const { method = 'GET', body, headers = {} } = options;
  const startTime = Date.now();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const latency = Date.now() - startTime;

  let responseBody: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: responseBody,
    latency_ms: latency,
  };
}

/**
 * Check if response is successful (2xx status)
 */
export function isSuccess(response: HttpResponse): boolean {
  return response.status >= 200 && response.status < 300;
}
