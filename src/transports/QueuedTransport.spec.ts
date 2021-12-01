import { Logger } from '../Logger';
import { QueuedTransport } from './QueuedTransport';
import { createSandbox } from 'sinon';
import { expect } from 'chai';
const sinon = createSandbox();

describe('QueuedTransport', () => {
    let transport: QueuedTransport;
    let logger: Logger;
    const now = new Date(
        2021, 2, 3,
        4, 5, 6, 789
    );

    beforeEach(() => {
        sinon.restore();
        sinon.stub(Logger.prototype as any, 'getCurrentDate').returns(now);
        transport = new QueuedTransport();
        logger = new Logger();
        logger.addTransport(transport);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('sends past messages when writer is attached', () => {
        logger.log(1);
        logger.log(2);
        const spy = sinon.spy();
        transport.setWriter(spy);
        expect(spy.args.map(x => x[0].args)).to.eql([
            [1],
            [2]
        ]);
    });

    it('writes to file', () => {
        logger.log('hello world');
    });
});
