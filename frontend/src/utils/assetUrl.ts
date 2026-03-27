const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ||
  "http://localhost:5243";

export function resolveAssetUrl(url?: string | null): string {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
}
