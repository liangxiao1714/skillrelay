import { SourceError } from "../errors/index.js";

/**
 * Fetch the text content of a URL using the Node.js built-in `fetch` API (Node ≥ 18).
 *
 * @throws `SourceError` on network failure, non-200 response, or non-text content-type.
 */
export async function fetchText(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new SourceError(`Network error fetching URL: ${url} — ${String(err)}`, { cause: err });
  }

  if (!response.ok) {
    throw new SourceError(`HTTP ${response.status} ${response.statusText} fetching URL: ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/json") &&
    !contentType.includes("text/") &&
    !url.endsWith(".md") &&
    !url.endsWith(".yaml") &&
    !url.endsWith(".yml")
  ) {
    throw new SourceError(
      `Unexpected content-type "${contentType}" for skill URL: ${url}. Expected text/markdown or text/plain.`,
    );
  }

  return response.text();
}
