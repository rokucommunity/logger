import * as chalk from 'chalk';
import type { ChalkFunction } from 'chalk';

export class Logger {

    constructor(prefix?: string);
    constructor(options?: Partial<LoggerOptions>);
    constructor(options?: Partial<LoggerOptions> | string) {
        this.options = this.sanitizeOptions(options);
    }

    /**
     * The options used to drive the functionality of this logger
     */
    private options: LoggerOptions;

    public get logLevel(): LogLevel {
        return this.options.logLevel ?? this.options.parent?.logLevel ?? 'log';
    }
    public set logLevel(value) {
        this.options.logLevel = value;
    }

    /**
     * Should colors be enabled when logging console output
     */
    public get enableColors(): boolean {
        return this.options.enableColors ?? this.options.parent?.enableColors ?? true;
    }
    public set enableColors(value) {
        this.options.enableColors = value;
    }

    /**
     * Should the console logging be enabled?
     */
    public get enableConsole(): boolean {
        return this.options.enableConsole ?? this.options.parent?.enableConsole ?? true;
    }
    public set enableConsole(value) {
        this.options.enableConsole = value;
    }

    /**
     * Get the prefix of this logger and all its parents
     */
    private get prefix(): string {
        return (this.options.parent?.prefix ?? '') + (this.options.prefix ?? '');
    }

    public get parent(): Logger | undefined {
        return this.options.parent;
    }
    public set parent(value) {
        this.options.parent = value;
    }

    /**
    * Get notified about every log message
    * @param subscriber a function that is called with the given log message
    * @returns an unsubscribe function
    */
    public subscribe(subscriber: Subscriber) {
        this.options.subscribers.push(subscriber);
        return () => {
            const index = this.options.subscribers.indexOf(subscriber);
            if (index > -1) {
                this.options.subscribers.splice(index, 1);
            }
        };
    }

    private emit(message: string) {
        for (const subscriber of this.options.subscribers ?? []) {
            subscriber(message);
        }
        //emit to parent as well
        this.options.parent?.emit(message);
    }

    private getTimestamp() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') +
            ':' +
            now.getMinutes().toString().padStart(2, '0') +
            ':' +
            now.getSeconds().toString().padStart(2, '0') +
            '.' + now.getMilliseconds().toString().padEnd(3, '0').substring(0, 3);
    }

    /**
     * The base logging function. Provide a level
     */
    public formatMessage(logLevel: LogLevel, ...messages: unknown[]) {
        let prefix = this.prefix;
        if (prefix) {
            prefix = ' ' + prefix;
        }
        let result: string;
        if (this.enableColors) {
            const logColorFn = LogLevelColor[logLevel];
            result = `[${chalk.grey(this.getTimestamp())}][${logColorFn(logLevel.toUpperCase())}]${prefix}`;
        } else {
            result = `[${this.getTimestamp()}][${logLevel.toUpperCase()}]${prefix}`;
        }

        for (const message of messages) {
            result += ' ' + message;
        }
        return result;
    }

    public write(logLevel: LogLevel, ...messages: unknown[]) {
        const lowerLogLevel = logLevel.toLowerCase();
        const incomingPriority = LogLevelPriority[lowerLogLevel] ?? LogLevelPriority.log;
        if (LogLevelPriority[this.logLevel] >= incomingPriority) {
            const message = this.formatMessage(logLevel, ...messages);
            this.emit(message);
            //if enabled, call the corresponding console method
            if (this.enableConsole) {
                (console as any)[lowerLogLevel]?.(message);
            }
        }
    }

    public trace(...messages: unknown[]) {
        this.write('trace', ...messages);
    }

    public debug(...messages: unknown[]) {
        this.write('debug', ...messages);
    }

    public info(...messages: unknown[]) {
        this.write('info', ...messages);
    }

    public log(...messages: unknown[]) {
        this.write('log', ...messages);
    }

    public warn(...messages: unknown[]) {
        this.write('warn', ...messages);
    }

    public error(...messages: unknown[]) {
        this.write('error', ...messages);
    }

    /**
     * Create a new logger that inherits all the properties of this current logger.
     * This is a one-time copy of the parent's properties to the child, so future changes to the parent logger will not
     * be reflected on the child logger.
     */
    public createLogger(): Logger;
    public createLogger(prefix: string): Logger;
    public createLogger(options: Partial<LoggerOptions>): Logger;
    public createLogger(param?: string | Partial<LoggerOptions>): Logger {
        const options = typeof param === 'string' ? { prefix: param } : param;
        return new Logger({
            ...options ?? {},
            parent: this
        });
    }

    /**
     * Create a new logger and pass it in as the first parameter of a callback.
     * This allows to created nested namespaced loggers without explicitly creating the
     * intermediary logger variable.
     * @returns any return value that the callback produces.
     */
    public useLogger<T>(prefix: string, callback: (logger: Logger) => T): T;
    public useLogger<T>(options: Partial<LoggerOptions>, callback: (logger: Logger) => T): T;
    public useLogger<T>(param: Partial<LoggerOptions> | string, callback: (logger: Logger) => T): T {
        const logger = this.createLogger(param as string); //typecast as string (to tell typescript to chill out)
        return callback(logger);
    }

    /**
     * Ensure we have a stable set of options.
     * @param options
     * @returns
     */
    private sanitizeOptions(param?: Partial<LoggerOptions> | string) {
        const options = typeof param === 'string' ? { prefix: param } : param;
        const result = {
            subscribers: [],
            prefix: undefined,
            ...options ?? {}
        } as LoggerOptions;
        result.logLevel = result.logLevel?.toLowerCase() as LogLevel;
        return result;
    }
}

export const LogLevelPriority = {
    off: 0,
    error: 1,
    warn: 2,
    log: 3,
    info: 4,
    debug: 5,
    trace: 6
} as Record<string, number>;

export const LogLevelColor = {
    off: x => x,
    error: chalk.red,
    warn: chalk.yellow,
    log: x => x,
    info: chalk.green,
    debug: chalk.blue,
    trace: chalk.magenta
} as Record<string, ChalkFunction>;

export type LogLevel = 'off' | 'error' | 'warn' | 'log' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
    /**
     * Should colors be enabled for logging?
     */
    enableColors: boolean;
    /**
     * If true, will call the underlying console function as well
     */
    enableConsole: boolean;
    /**
     * A prefix applied to every log entry. Appears directly after the logLevel
     */
    prefix: string;
    /**
     * The level of logging that should be emitted.
     */
    logLevel: LogLevel;
    /**
     * A list of functions that will be called with the final log ouptut whenever a log message is received
     */
    subscribers: Subscriber[];
    /**
     * A parent logger. Any unspecified options in the current logger will be loaded from the parent.
     */
    parent?: Logger;
}

export type Subscriber = (message: string) => void;
