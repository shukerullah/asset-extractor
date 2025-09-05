/**
 * Production-safe logging utility
 * Only logs in development environment
 */

type LogLevel = 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`❌ ${message}`, error, ...args);
    }
    // In production, you might want to send errors to a monitoring service
    // Example: sendToMonitoringService(message, error, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  },
  
  progress: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔄 ${message}`, ...args);
    }
  }
};

export default logger;