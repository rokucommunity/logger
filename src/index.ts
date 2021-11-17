import { Logger } from './Logger';
import { ConsoleTransport } from './transports/ConsoleTransport';

const logger = new Logger({ transports: [new ConsoleTransport()] });

export * from './transports/ConsoleTransport';
export * from './transports/FileTransport';
export * from './Logger';

export default logger;
module.exports = logger;
