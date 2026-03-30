"use client";

import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  progress: number;
  message?: string;
}

export default function ProgressBar({ progress, message }: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${clamped}%` }} />
      </div>
      {message && (
        <p className={styles.message}>
          {Math.round(clamped)}% — {message}
        </p>
      )}
    </div>
  );
}
