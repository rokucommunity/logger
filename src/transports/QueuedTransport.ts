import type { LogMessage, MessageHandler } from '../Logger';

export class QueuedTransport {
    public constructor(
        /**
         * A function to be called any time a message needs to be written
         */
        writer?: MessageHandler
    ) {
        this.setWriter(writer);
    }

    private messageQueue: LogMessage[] = [];
    private writer?: MessageHandler;

    public setWriter(writer: MessageHandler | undefined) {
        this.writer = writer;
        if (typeof this.writer === 'function') {
            try {
                if (this.messageQueue.length > 0) {
                    for (const message of this.messageQueue) {
                        this.writer(message);
                    }
                }
            } finally {
                this.messageQueue = [];
            }
        }
    }


    pipe(message: LogMessage) {
        if (this.writer) {
            this.writer(message);
        } else {
            this.messageQueue.push(message);
        }
    }
}
