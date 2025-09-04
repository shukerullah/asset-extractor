'use client';

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
    <div className={`w-full ${className}`}>
      <div className="bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center">
          {Math.round(progress)}% - {message}
        </p>
      )}
    </div>
  );
}