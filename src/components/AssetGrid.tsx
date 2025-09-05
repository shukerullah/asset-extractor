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
      <button className={styles.buttonPrimary} onClick={onDownloadAll}>
        Download All
      </button>
      
      <div className={styles.resultGrid}>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.resultItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.name} />
            <p>{asset.name}</p>
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