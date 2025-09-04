// Error monitoring and logging service
interface ErrorLog {
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorMonitor {
  private logs: ErrorLog[] = [];
  private readonly maxLogs = 1000;

  log(
    error: Error | string, 
    context?: Record<string, unknown>, 
    severity: ErrorLog['severity'] = 'medium'
  ): void {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      severity
    };

    this.logs.push(errorLog);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console with appropriate level
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 
                     severity === 'medium' ? 'warn' : 'info';
    
    console[logMethod](`[${severity.toUpperCase()}] ${errorLog.message}`, {
      timestamp: new Date(errorLog.timestamp).toISOString(),
      context,
      stack: errorLog.stack
    });
  }

  getRecentErrors(limit = 50): ErrorLog[] {
    return this.logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    lastHour: number;
  } {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const bySeverity = this.logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      bySeverity,
      lastHour: this.logs.filter(log => log.timestamp > oneHourAgo).length
    };
  }

  clear(): void {
    this.logs = [];
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor();

// Utility function for API error responses
export function createApiError(
  message: string,
  status = 500,
  details?: string,
  context?: Record<string, unknown>
): Response {
  const severity: ErrorLog['severity'] = 
    status >= 500 ? 'high' : 
    status >= 400 ? 'medium' : 'low';

  errorMonitor.log(message, { status, details, ...context }, severity);

  return Response.json(
    { 
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    },
    { status }
  );
}