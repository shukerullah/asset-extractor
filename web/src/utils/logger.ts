const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`ℹ️  ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(`⚠️  ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    if (isDev) console.error(`❌ ${message}`, ...args);
  },
};
