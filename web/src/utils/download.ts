import type { Asset } from "@/types";

export function downloadAsset(asset: Asset): void {
  const link = document.createElement("a");
  link.href = asset.url;
  link.download = asset.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAllAssets(assets: Asset[], delayMs = 500): void {
  assets.forEach((asset, i) => {
    setTimeout(() => downloadAsset(asset), i * delayMs);
  });
}
