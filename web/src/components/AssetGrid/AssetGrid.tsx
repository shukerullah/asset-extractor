"use client";

import type { AssetGridProps } from "@/types";
import styles from "./AssetGrid.module.css";

export default function AssetGrid({
  assets,
  onDownload,
  onDownloadAll,
}: AssetGridProps) {
  if (!assets.length) return null;

  return (
    <>
      <h3 className={styles.heading}>🎉 Generated Assets ({assets.length})</h3>
      <button className={styles.downloadAllButton} onClick={onDownloadAll}>
        Download All
      </button>

      <div className={styles.grid}>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.item}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.name} className={styles.preview} />
            <p className={styles.name}>{asset.name}</p>
            <button
              className={styles.downloadButton}
              onClick={() => onDownload(asset)}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
