import { Logger } from './Logger';
import { ConsoleTransport } from './transports/ConsoleTransport';

/**
 * The default, shared logger instance. Writes to the console out of the box.
 * @public
 */
export const logger = new Logger({ transports: [new ConsoleTransport()] });

/**
 * Create a new logger that inherits all the properties of this current logger.
 * This is a one-time copy of the parent's properties to the child, so future changes to the parent logger will not
 * be reflected on the child logger.
 * @public
 */
export const createLogger = logger.createLogger.bind(logger);

export * from './transports/ConsoleTransport';
export * from './transports/FileTransport';
export * from './transports/QueuedTransport';
export * from './Logger';

export default logger;
