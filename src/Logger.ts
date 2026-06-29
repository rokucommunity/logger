import { safeJsonStringify, serializeError, formatTimestamp } from './util';
import type { ChalkFunction } from 'chalk';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Chalk = require('chalk');
import { Stopwatch } from './Stopwatch';

/**
 * Our shared chalk instance. Exported only so unit tests can assert against the exact color functions
 * the logger uses; it is not part of the public API.
 * @internal
 */
export const chalk = new Chalk.Instance({ level: 3 });

/**
 * The core logger. Handles formatting, log-level filtering, prefixes, timing helpers, child loggers,
 * and dispatching messages to its {@link Transport | transports}.
 * @public
 */
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

    /**
     * The timestamp format string. Defaults to 'HH:mm:ss.SSS' (24-hour time with milliseconds)
     *
     * https://date-fns.org/v2.30.0/docs/format
     */
    public get timestampFormat(): string {
        return this.options.timestampFormat ?? this.options.parent?.timestampFormat ?? 'HH:mm:ss.SSS';
    }
    public set timestampFormat(value: string | undefined) {
        this.options.timestampFormat = value;
    }

    /**
     * The log level of this logger. If a log level is not specified, it will inherit from the parent logger or default to 'log'
     */
    public get logLevel(): LogLevel | LogLevelNumeric {
        return this.options.logLevel ?? this.options.parent?.logLevel ?? 'log';
    }
    public set logLevel(value: LogLevel | LogLevelNumeric) {
        this.options.logLevel = typeof value === 'number' ? this.getLogLevelNumeric(value) : this.getLogLevelText(value);
    }

    /**
     * Given a LogLevel number or string, return the string representation of the LogLevel
     */
    public getLogLevelText(logLevel: LogLevel | LogLevelNumeric): LogLevel {
        if (typeof logLevel === 'number') {
            return LogLevelNumeric[logLevel] as LogLevel;
        }
        return logLevel;
    }

    /**
     * Given a LogLevel number or string, return the string representation of the LogLevel
     */
    public getLogLevelNumeric(logLevel: LogLevel | LogLevelNumeric): LogLevelNumeric {
        if (typeof logLevel === 'string') {
            return LogLevelNumeric[logLevel];
        }
        return logLevel;
    }

    /**
     * Get the prefix of this logger and all its parents
     */
    private getPrefixes(): string[] {
        const prefixes = this.options.parent?.getPrefixes() ?? [];
        if (this.options.prefix) {
            prefixes.push(this.options.prefix);
        }
        return prefixes;
    }

    /**
     * The prefix for the current logger only. This excludes prefixes inherited from parent loggers.
     */
    public get prefix() {
        return this.options.prefix;
    }
    public set prefix(value: string | undefined) {
        this.options.prefix = value;
    }

    public get parent(): Logger | undefined {
        return this.options.parent;
    }
    public set parent(value: Logger | undefined) {
        this.options.parent = value;
    }

    public get transports() {
        return this.options.transports;
    }
    public set transports(value: Transport[]) {
        this.options.transports = value;
    }

    /**
     * If true, colors will be used in transports that support it.
     */
    public get enableColor(): boolean {
        return this.options.enableColor ?? this.options.parent?.enableColor ?? true;
    }
    public set enableColor(value: boolean) {
        this.options.enableColor = value;
    }

    /**
     * Get colored text if color is enabled, or the raw text back if color is not enabled
     */
    private colorWrap(text: string, color: keyof typeof chalk, enableColor = this.enableColor) {
        if (enableColor) {
            return (chalk[color] as any)(text);
        } else {
            return text;
        }
    }

    /**
     * Wrap the text in the color of the given logLevel
     */
    private logLevelColorWrap(text: string, logLevel: LogLevel, enableColor = this.enableColor) {
        if (enableColor) {
            const logColorFn = LogLevelColor[logLevel] ?? LogLevelColor.log;
            return logColorFn(text);
        } else {
            return text;
        }
    }

    /**
     * Should the log level be padded with trailing spaces when printed
     */
    public get consistentLogLevelWidth(): boolean {
        return this.options.consistentLogLevelWidth ?? this.options.parent?.consistentLogLevelWidth ?? false;
    }
    public set consistentLogLevelWidth(value: boolean) {
        this.options.consistentLogLevelWidth = value;
    }

    /**
     * Should the log level be printed
     */
    public get printLogLevel(): boolean {
        return this.options.printLogLevel ?? this.options.parent?.printLogLevel ?? true;
    }
    public set printLogLevel(value: boolean) {
        this.options.printLogLevel = value;
    }

    /**
     * Should the timestamp be printed
     */
    public get printTimestamp(): boolean {
        return this.options.printTimestamp ?? this.options.parent?.printTimestamp ?? true;
    }
    public set printTimestamp(value: boolean) {
        this.options.printTimestamp = value;
    }

    /**
    * Get notified about every log message
    * @param subscriber - a function that is called with the given log message
    * @returns an unsubscribe function
    */
    public subscribe(subscriber: MessageHandler) {
        return this.addTransport({
            pipe: subscriber
        });
    }

    /**
     * Register a transport handler to be notified of all log events
     */
    public addTransport(transport: Transport) {
        this.options.transports.push(transport);
        return () => {
            this.removeTransport(transport);
        };
    }

    /**
     * Remove a transport from this logger instance (but not parents
     */
    public removeTransport(transport: Transport) {
        const index = this.options.transports.indexOf(transport);
        if (index > -1) {
            this.options.transports.splice(index, 1);
        }
    }

    private emit(message: LogMessage) {
        for (const transport of this.options.transports ?? []) {
            transport.pipe(message);
        }
        //emit to parent as well
        this.options.parent?.emit(message);
    }

    public formatTimestamp(date: Date) {
        if (this.timestampFormat === '') {
            // format will crash if the format string is empty so skip it
            return '';
        }
        return formatTimestamp(date, this.timestampFormat);
    }

    /**
     * Get the current date. Mostly here to allow mocking for unit tests
     */
    private getCurrentDate() {
        return new Date();
    }

    /**
     * Given an array of args, stringify them
     */
    public stringifyArgs(args: unknown[]) {
        let argsText = '';
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            //separate args with a space
            if (i > 0) {
                argsText += ' ';
            }
            const argType = typeof arg;
            switch (argType) {
                case 'string':
                    argsText += arg;
                    break;
                case 'undefined':
                    argsText += 'undefined';
                    break;
                case 'object':
                    if (toString.call(arg) === '[object RegExp]') {
                        argsText += (arg as RegExp).toString();
                    } else {
                        argsText += safeJsonStringify(
                            serializeError(arg),
                            (_, value) => {
                                return typeof value === 'bigint' ? value.toString() : value;
                            }
                        );
                    }
                    break;
                default:
                    argsText += (arg as any).toString();
                    break;
            }
        }
        return argsText;
    }

    /**
     * Get all the leading parts of the message. This includes timestamp, log level, any message prefixes.
     * This excludes actual body of the messages.
     */
    public formatLeadingMessageParts(message: LogMessage, enableColor = this.enableColor) {
        let timestampText = message.timestamp;
        let logLevelText = message.logLevel.toUpperCase();
        if (this.consistentLogLevelWidth) {
            logLevelText = logLevelText.padEnd(5, ' ');
        }

        let result = '';
        // only include the timestamp if it's enabled or if it's not empty
        if (this.printTimestamp && timestampText) {
            result = '[' + this.colorWrap(timestampText, 'grey', enableColor) + ']';
        }
        if (this.printLogLevel) {
            result += '[' + this.logLevelColorWrap(logLevelText, message.logLevel, enableColor) + ']';
        }

        const prefix = message.prefixes.join('');
        //separate the datestamp from the prefix with a space
        if (prefix.length > 0) {
            result += ' ' + prefix;
        }

        return result;
    }

    /**
     * Build a single string from the LogMessage in the Logger-standard format
     */
    public formatMessage(message: LogMessage, enableColor = false) {
        return this.formatLeadingMessageParts(message, enableColor) + ' ' + message.argsText;
    }

    /**
     * The base logging function. Provide a level
     */
    public buildLogMessage(logLevel: LogLevel | LogLevelNumeric, ...args: unknown[]) {
        const date = this.getCurrentDate();
        const timestamp = this.formatTimestamp(date);

        return {
            date: date,
            timestamp: timestamp,
            prefixes: this.getPrefixes(),
            logLevel: this.getLogLevelText(logLevel),
            args: args,
            argsText: this.stringifyArgs(args),
            logger: this
        } as LogMessage;
    }

    /**
     * Determine if the specified logLevel is currently active.
     */
    public isLogLevelEnabled(targetLogLevel: LogLevel | LogLevelNumeric) {
        const lowerTargetLogLevel = this.getLogLevelText(targetLogLevel);
        const incomingPriority = LogLevelPriority[lowerTargetLogLevel] ?? LogLevelPriority.log;
        const currentLogLevel = this.getLogLevelText(this.logLevel);
        return LogLevelPriority[currentLogLevel] >= incomingPriority;
    }

    /**
     * Write a log entry IF the specified logLevel is enabled
     */
    public write(logLevel: LogLevel | LogLevelNumeric, ...args: unknown[]) {
        if (this.isLogLevelEnabled(logLevel)) {
            const message = this.buildLogMessage(logLevel, ...args);
            this.emit(message);
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
     * Writes to the log (if logLevel matches), and also provides a function that can be called to mark the end of a time.
     */
    public timeStart(logLevel: LogLevel | LogLevelNumeric, ...messages: unknown[]) {
        //call the log if loglevel is in range
        if (this.isLogLevelEnabled(logLevel)) {
            const stopwatch = new Stopwatch();

            //write the initial log
            this.write(logLevel, ...messages);

            stopwatch.start();

            return (status = 'finished') => {
                stopwatch.stop();
                this.write(logLevel, ...messages, `${status}. (${this.colorWrap(stopwatch.getDurationText(), 'blue')})`);
            };
        }
        return noop;
    }

    /**
     * Writes to the log (if logLevel matches), and also times how long the action took to occur.
     * `action` is called regardless of logLevel, so this function can be used to nicely wrap
     * pieces of functionality.
     * The action function also includes two parameters, `pause` and `resume`, which can be used to improve timings by focusing only on
     * the actual logic of that action.
     */
    time<T>(logLevel: LogLevel | LogLevelNumeric, messages: any[], action: (pause: () => void, resume: () => void) => T): T {
        //call the log if loglevel is in range
        if (this.isLogLevelEnabled(logLevel)) {
            const stopwatch = new Stopwatch();
            messages = Array.isArray(messages) ? messages : [messages];

            //write the initial log
            this.write(logLevel, ...messages as unknown[]);

            stopwatch.start();
            //execute the action
            const result = action(stopwatch.stop.bind(stopwatch), stopwatch.start.bind(stopwatch)) as any;

            //return a function to call when the timer is complete
            const done = () => {
                stopwatch.stop();
                this.write(logLevel, ...messages as unknown[], `finished. (${this.colorWrap(stopwatch.getDurationText(), 'blue')})`);
            };

            //if this is a promise, wait for it to resolve and then return the original result
            if (typeof result?.then === 'function') {
                return Promise.resolve(result).then(done).then(() => {
                    return result;
                }) as any;
            } else {
                //this was not a promise. finish the timer now
                done();
                return result;
            }
        } else {
            return action(noop, noop);
        }
    }

    /**
     * Create a new logger that inherits all the properties of this current logger.
     * This is a one-time copy of the parent's properties to the child, so future changes to the parent logger will not
     * be reflected on the child logger.
     */
    public createLogger(): Logger;
    public createLogger(prefix: string): Logger;
    public createLogger(options: Partial<LoggerOptions>): Logger;
    public createLogger(param?: Partial<LoggerOptions> | string): Logger {
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
     * @param param - a prefix string or partial options object to normalize
     * @returns the normalized {@link LoggerOptions}
     */
    private sanitizeOptions(param?: Partial<LoggerOptions> | string) {
        const options = typeof param === 'string' ? { prefix: param } : param;
        const result = {
            transports: [],
            prefix: undefined,
            ...options ?? {}
        } as LoggerOptions;
        if (typeof result.logLevel === 'number') {
            result.logLevel = LogLevelNumeric[result.logLevel] as LogLevel;
        }
        result.logLevel = result.logLevel?.toLowerCase() as LogLevel;
        return result;
    }

    public destroy() {
        for (const transport of this.options?.transports ?? []) {
            transport?.destroy?.();
        }
        if (this.options) {
            this.options.transports = [];
            this.options.parent = undefined;
        }
    }
}

/**
 * Maps each {@link LogLevel} to its numeric priority, used to decide whether a message at a given level
 * should be emitted. Exposed so consumers can convert a {@link LogLevel} to its numeric form (the same
 * conversion {@link Logger.getLogLevelNumeric} performs).
 * @public
 */
export const LogLevelPriority = {
    off: 0,
    error: 1,
    warn: 2,
    log: 3,
    info: 4,
    debug: 5,
    trace: 6
} as Record<string, number>;

/**
 * The numeric form of each {@link LogLevel}. Accepted anywhere a {@link LogLevel} is, for callers who
 * prefer numeric levels.
 * @public
 */
export enum LogLevelNumeric {
    off = 0,
    error = 1,
    warn = 2,
    log = 3,
    info = 4,
    debug = 5,
    trace = 6
}

/**
 * The set of textual log levels, ordered from least to most verbose.
 * @public
 */
export type LogLevel = 'off' | 'error' | 'warn' | 'log' | 'info' | 'debug' | 'trace';

/**
 * The options used to construct or configure a {@link Logger}.
 * @public
 */
export interface LoggerOptions {

    /**
     * The timestamp format string. Defaults to 'HH:mm:ss.SSS' (24-hour time with milliseconds)
     *
     * https://date-fns.org/v2.30.0/docs/format
     */
    timestampFormat?: string;

    /**
     * A prefix applied to every log entry. Appears directly after the logLevel
     */
    prefix: string | undefined;

    /**
     * The level of logging that should be emitted.
     */
    logLevel: LogLevel | LogLevelNumeric;

    /**
     * A list of functions that will be called whenever a log message is received
     */
    transports: Transport[];

    /**
     * A parent logger. Any unspecified options in the current logger will be loaded from the parent.
     */
    parent?: Logger;

    /**
     * If true, colors will be used in transports that support it. If the console you're using doesn't support colors, then colors will still be disabled.
     * This is a way to disable colors globally in situations when color IS supported.
     */
    enableColor?: boolean;

    /**
     * Should the log level be padded with trailing spaces when printed
     */
    consistentLogLevelWidth?: boolean;

    /**
     * Should the log level be printed in the log message
     */
    printLogLevel?: boolean;

    /**
     * Should the timestamp be printed in the log message
     */
    printTimestamp?: boolean;
}

/**
 * A single log entry as seen by {@link Transport | transports}. Carries the raw args, the formatted text,
 * the level, timestamp, prefixes, and a reference back to the originating {@link Logger}.
 * @public
 */
export interface LogMessage {

    /**
     * A js Date instance when the log message was created
     */
    date: Date;

    /**
     * A formatted timestamp string
     */
    timestamp: string;

    /**
     * The LogLevel this LogMessage was emitted with.
     */
    logLevel: LogLevel;

    /**
     * The list of prefixes at the time of this LogMessage. Empty prefixes are omitted.
     */
    prefixes: string[];

    /**
     * The arguments passed to the log function
     */
    args: unknown[];

    /**
     * The stringified version of the arguments
     */
    argsText: string;

    /**
     * The instance of the logger this message was created with
     */
    logger: Logger;
}

/**
 * A function that receives a {@link LogMessage}. Used by {@link Logger.subscribe} and as the writer for
 * queue-based transports.
 * @public
 */
export type MessageHandler = (message: LogMessage) => void;

/**
 * The contract a transport must implement to receive log messages from a {@link Logger}.
 * @public
 */
export interface Transport {

    /**
     * Receives the incoming message
     */
    pipe(message: LogMessage): void;

    /**
     * Called whenever the logger is destroyed, allows the transport to clean itself up
     */
    destroy?(): void;
}

/**
 * Maps each {@link LogLevel} to the chalk color function used when rendering that level. Internal styling detail.
 * @internal
 */
export const LogLevelColor = {
    off: x => x,
    error: chalk.red,
    warn: chalk.yellow,
    log: x => x,
    info: chalk.green,
    debug: chalk.blue,
    trace: chalk.magenta
} as Record<string, ChalkFunction>;

/**
 * Empty function that does nothing
 */
function noop() {

}
