import { API_BASE_URL } from "../config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
}

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

export async function apiFetch<T>(
  path: string,
  method: HttpMethod = "GET",
  options: RequestOptions = {}
): Promise<T> {
  const { query, headers, body, ...rest } = options;

  const url = buildUrl(path, query);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body,
    ...rest,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Request failed with status ${response.status}: ${errorText || response.statusText}`
    );
  }

  return (await response.json()) as T;
}

