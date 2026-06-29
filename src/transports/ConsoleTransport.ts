import type { LogMessage } from '../Logger';

/**
 * A {@link Transport} that writes log messages to the console, routing each message to the matching
 * `console` method (e.g. `console.warn` for warnings) and falling back to `console.log`.
 * @public
 */
export class ConsoleTransport {
    pipe(message: LogMessage) {
        const methodName = (console as any)[message.logLevel] ? message.logLevel : 'log';

        (console as any)[methodName](
            message.logger.formatLeadingMessageParts(message),
            ...message.args
        );
    }
}
