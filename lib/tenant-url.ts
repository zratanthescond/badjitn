// Public URL of a client's back office, derived from the site's base URL:
//   https://badgi.net        -> https://<slug>.pro.badgi.net
//   http://localhost:3000    -> http://<slug>.pro.localhost:3000
export function getTenantUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  try {
    const url = new URL(base);
    const host = url.hostname.replace(/^www\./, "");
    const port = url.port ? `:${url.port}` : "";
    return `${url.protocol}//${slug}.pro.${host}${port}`;
  } catch {
    return `https://${slug}.pro.badgi.net`;
  }
}
