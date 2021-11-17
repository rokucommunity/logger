import type { LogMessage } from '../Logger';
import * as fsExtra from 'fs-extra';

export class FileTransport {
    constructor(
        public readonly logFilePath: string
    ) {
    }

    pipe(message: LogMessage) {
        fsExtra.appendFileSync(
            this.logFilePath,
            message.logger.formatMessage(message) + '\n'
        );
    }
}
