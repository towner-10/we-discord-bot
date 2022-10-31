const reset = '\x1b[0m';
const textRed = '\x1b[31m';
const textGreen = '\x1b[32m';
const textYellow = '\x1b[33m';
const textBlue = '\x1b[34m';
const textCyan = '\x1b[36m';
const textMagenta = '\x1b[35m';

const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';

enum LogLevel {
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Debug = 'debug'
}

/**
 * A simple logger class that logs to the console.
 * 
 * SUCCESS: Green
 * INFO: Blue
 * WARN: Yellow
 * ERROR: Red
 * DEBUG: Cyan
 */
export const logger = {
    info: (message: string) => {
        if (logLevel === LogLevel.Info || logLevel === LogLevel.Debug)
            console.log(`${textBlue}🔵 INFO${reset}: ${message}`);
    },
    debug: (message: string) => {
        if (logLevel === LogLevel.Debug)
            console.log(`${textCyan}🐛 DEBUG${reset}: ${message}`);
    },
    waiting: (message: string) => {
        if (logLevel === LogLevel.Info || logLevel === LogLevel.Debug)
            console.log(`${textMagenta}⏳ WAITING${reset}: ${message}`);
    },
    warn: (message: string) => {
        if (logLevel === LogLevel.Info || logLevel === LogLevel.Debug || logLevel === LogLevel.Warn)
            console.log(`${textYellow}🟡 WARN${reset}: ${message}`);
    },
    success: (message: string) => {
        console.log(`${textGreen}✅ SUCCESS${reset}: ${message}`);
    },
    error: (message: string) => {
        console.log(`${textRed}❌ ERROR${reset}: ${message}`);
    }
}