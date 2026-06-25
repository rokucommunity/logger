import * as fs from 'fs';
import { QueuedTransport } from './QueuedTransport';
import * as path from 'path';

export class FileTransport extends QueuedTransport {
    constructor(
        logFilePath?: string
    ) {
        super();
        this.setLogFilePath(logFilePath);
    }

    public setLogFilePath(logfilePath?: string) {
        //if we have a logfile path, set the writer function which will flush the logs and enable future logging
        if (typeof logfilePath === 'string') {
            this.setWriter((message) => {
                //make sure the parent directory exists
                fs.mkdirSync(
                    path.dirname(logfilePath),
                    { recursive: true }
                );
                //append the log entry to the file
                fs.appendFileSync(
                    logfilePath,
                    message.logger.formatMessage(message) + '\n'
                );
            });
        } else {
            this.setWriter(undefined);
        }
    }
}
