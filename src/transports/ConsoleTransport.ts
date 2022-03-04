import type { LogMessage } from '..';

export class ConsoleTransport {
    pipe(message: LogMessage) {
        const methodName = (console as any)[message.logLevel] ? message.logLevel : 'log';

        (console as any)[methodName](
            message.logger.formatLeadingMessageParts(message, true),
            ...message.args
        );
    }
}
