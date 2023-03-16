import type { LogMessage } from '../Logger';

export class ConsoleTransport {
    pipe(message: LogMessage) {
        const methodName = (console as any)[message.logLevel] ? message.logLevel : 'log';

        (console as any)[methodName](
            message.logger.formatLeadingMessageParts(message),
            ...message.args
        );
    }
}
