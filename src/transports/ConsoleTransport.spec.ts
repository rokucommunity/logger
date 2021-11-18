import { Logger, chalk } from '../Logger';
import { ConsoleTransport } from './ConsoleTransport';
import { createSandbox } from 'sinon';
import { expect } from 'chai';
const sinon = createSandbox();

describe('ConsoleTransport', () => {
    let transport: ConsoleTransport;
    let logger: Logger;
    const now = new Date(
        2021, 2, 3,
        4, 5, 6, 789
    );
    const timestamp = '04:05:06.789';

    beforeEach(() => {
        sinon.restore();
        sinon.stub(Logger.prototype as any, 'getCurrentDate').returns(now);
        transport = new ConsoleTransport();
        logger = new Logger();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('writes to the console', () => {
        const stub = sinon.stub(console, 'error');
        transport.pipe(logger.buildLogMessage('error', 'hello world'));
        expect(stub.args[0][0]).to.eql(
            chalk.grey('[' + timestamp + ']') +
            '[' + chalk.red('ERROR') + '] ' +
            'hello world'
        );
    });

    it('handles prefixing properly', () => {
        const stub = sinon.stub(console, 'error');
        logger = logger.createLogger('a').createLogger('b').createLogger('c');
        transport.pipe(
            logger.buildLogMessage('error', 'hello world')
        );
        expect(stub.args[0][0]).to.eql(
            chalk.grey('[' + timestamp + ']') +
            '[' + chalk.red('ERROR') + '] ' +
            'abc ' +
            'hello world'
        );
    });

    it('defaults to the "log" function call for custom type', () => {
        const stub = sinon.stub(console, 'log');
        transport.pipe(
            logger.buildLogMessage('CUSTOM' as any, 'asdf')
        );
        expect(stub.callCount).to.equal(1);
    });

    it('actually calls the console', () => {
        transport.pipe(
            logger.buildLogMessage('error', 'message')
        );
    });
});
