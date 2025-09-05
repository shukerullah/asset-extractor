'use client';

import styles from '../app/page.module.css';

interface ProgressBarProps {
  progress: number;
  message?: string;
  className?: string;
}

/**
 * Progress Bar Component
 * Shows processing progress with optional message
 */
export default function ProgressBar({ progress, message, className = '' }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {message && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          {Math.round(progress)}% - {message}
        </p>
      )}
    </div>
  );
}