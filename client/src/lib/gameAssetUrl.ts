export function gameAssetUrl(assetUrl: string) {
  if (import.meta.env.MODE === "github-pages" && assetUrl.startsWith("/manus-storage/")) {
    return `${import.meta.env.BASE_URL}${assetUrl.slice(1)}`;
  }
  return assetUrl;
}
