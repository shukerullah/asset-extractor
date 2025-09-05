'use client';

import type { AssetGridProps } from '@/types';
import styles from '../app/page.module.css';

/**
 * Asset Grid Component
 * Displays generated assets with download functionality
 */
export default function AssetGrid({ assets, onDownload, onDownloadAll }: AssetGridProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <>
      <h3>🎉 Generated Assets ({assets.length})</h3>
      <button className={styles.btnPrimary} onClick={onDownloadAll}>
        Download All
      </button>
      
      <div className={styles.assetGrid}>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.assetItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.name} />
            <p>{asset.name}</p>
            <button 
              className={styles.downloadBtn}
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