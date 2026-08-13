const managedAssetPrefix = "/manus-storage/";

export function toOptimizedCardAssetName(assetUrl: string, _width: 240 | 480 = 480) {
  const assetName = assetUrl.startsWith(managedAssetPrefix)
    ? assetUrl.slice(managedAssetPrefix.length)
    : assetUrl;
  return assetName;
}

export function gameAssetUrl(assetUrl: string, _width: 240 | 480 = 480) {
  if (import.meta.env.MODE === "github-pages" && assetUrl.startsWith(managedAssetPrefix)) {
    const filename = assetUrl.slice(managedAssetPrefix.length);
    return `${import.meta.env.BASE_URL}manus-storage/${filename}`;
  }
  return assetUrl;
}

export function gameAssetSrcSet(_assetUrl: string) {
  return undefined;
}
