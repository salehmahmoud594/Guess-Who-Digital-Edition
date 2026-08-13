const managedAssetPrefix = "/manus-storage/";
const supportedImageExtension = /\.(png|jpe?g|webp)$/i;

export function toOptimizedCardAssetName(assetUrl: string, width: 240 | 480 = 480) {
  const assetName = assetUrl.startsWith(managedAssetPrefix)
    ? assetUrl.slice(managedAssetPrefix.length)
    : assetUrl;
  return supportedImageExtension.test(assetName)
    ? assetName.replace(supportedImageExtension, `-${width}.webp`)
    : assetName;
}

export function gameAssetUrl(assetUrl: string, width: 240 | 480 = 480) {
  if (import.meta.env.MODE === "github-pages" && assetUrl.startsWith(managedAssetPrefix)) {
    return `${import.meta.env.BASE_URL}manus-storage/${toOptimizedCardAssetName(assetUrl, width)}`;
  }
  return assetUrl;
}

export function gameAssetSrcSet(assetUrl: string) {
  if (import.meta.env.MODE !== "github-pages" || !assetUrl.startsWith(managedAssetPrefix)) {
    return undefined;
  }
  return `${gameAssetUrl(assetUrl, 240)} 240w, ${gameAssetUrl(assetUrl, 480)} 480w`;
}
