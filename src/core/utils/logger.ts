enum LogColor {
    Reset = '\x1b[0m',
    Red = '\x1b[31m',
    Yellow = '\x1b[33m',
    Blue = '\x1b[34m',
    Green = '\x1b[32m',
    Gray = '\x1b[90m',
}

class Logger {
    private formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `${LogColor.Gray}[${timestamp}]${LogColor.Reset} ${level}: ${message}${metaStr}`;
    }

    info(message: string, meta?: any): void {
        const level = `${LogColor.Blue}[INFO]${LogColor.Reset}`;
        console.log(this.formatMessage(level, message, meta));
    }

    error(message: string, meta?: any): void {
        const level = `${LogColor.Red}[ERROR]${LogColor.Reset}`;
        console.error(this.formatMessage(level, message, meta));
    }

    warn(message: string, meta?: any): void {
        const level = `${LogColor.Yellow}[WARN]${LogColor.Reset}`;
        console.warn(this.formatMessage(level, message, meta));
    }

    debug(message: string, meta?: any): void {
        if (process.env.NODE_ENV === 'development') {
            const level = `${LogColor.Green}[DEBUG]${LogColor.Reset}`;
            console.debug(this.formatMessage(level, message, meta));
        }
    }
}

export const logger = new Logger();
