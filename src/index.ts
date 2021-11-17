import { Logger } from './Logger';
import { ConsoleTransport } from './transports/ConsoleTransport';

export * from './Logger';
const logger = new Logger({ transports: [new ConsoleTransport()] });
export default logger;
module.exports = logger;
