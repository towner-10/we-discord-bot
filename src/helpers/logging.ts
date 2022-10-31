const reset = '\x1b[0m';
const textRed = '\x1b[31m';
const textGreen = '\x1b[32m';
const textYellow = '\x1b[33m';
const textBlue = '\x1b[34m';
const textCyan = '\x1b[36m';
const textMagenta = '\x1b[35m';

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
        if (process.env.LOG_LEVEL === LogLevel.Info || process.env.LOG_LEVEL === LogLevel.Debug)
            console.log(`${textBlue}🔵 INFO${reset}: ${message}`);
    },
    debug: (message: string) => {
        if (process.env.LOG_LEVEL === LogLevel.Debug)
            console.log(`${textCyan}🐛 DEBUG${reset}: ${message}`);
    },
    waiting: (message: string) => {
        if (process.env.LOG_LEVEL === LogLevel.Info || process.env.LOG_LEVEL === LogLevel.Debug)
            console.log(`${textMagenta}⏳ WAITING${reset}: ${message}`);
    },
    warn: (message: string) => {
        if (process.env.LOG_LEVEL === LogLevel.Info || process.env.LOG_LEVEL === LogLevel.Debug || process.env.LOG_LEVEL === LogLevel.Warn)
            console.log(`${textYellow}🟡 WARN${reset}: ${message}`);
    },
    success: (message: string) => {
        console.log(`${textGreen}✅ SUCCESS${reset}: ${message}`);
    },
    error: (message: string) => {
        console.log(`${textRed}❌ ERROR${reset}: ${message}`);
    }
}