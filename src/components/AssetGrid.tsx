'use client';

import type { AssetGridProps } from '@/types';

/**
 * Asset Grid Component
 * Displays generated assets with download functionality
 */
export default function AssetGrid({ assets, onDownload, onDownloadAll }: AssetGridProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          🎉 Generated Assets ({assets.length})
        </h3>
        <button
          onClick={onDownloadAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Download All
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 mb-2 truncate" title={asset.name}>
                {asset.name}
              </p>
              <button
                onClick={() => onDownload(asset)}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}