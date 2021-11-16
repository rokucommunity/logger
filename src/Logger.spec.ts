import { expect } from 'chai';
import type { LogLevel } from './Logger';
import { Logger, LogLevelColor } from './Logger';
import { createSandbox } from 'sinon';
import * as chalk from 'chalk';
const sinon = createSandbox();

describe('Logger', () => {
    let logger: Logger;
    const timestamp = '04:05:06.789';

    beforeEach(() => {
        sinon.restore();
        sinon.stub(Logger.prototype as any, 'getTimestamp').returns(timestamp);
        logger = new Logger({
            enableColors: false
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('uses LogLevel.log by default', () => {
        logger = new Logger();
        expect(logger.logLevel).to.eql('log');
    });

    describe('formatMessage', () => {
        it('works', () => {
            expect(
                logger['formatMessage']('debug', 'hello world')
            ).to.eql(`[${timestamp}][DEBUG] hello world`);
        });

        it('supports nested prefixes', () => {
            logger = logger
                .createLogger({ prefix: '[A]' })
                .createLogger({ prefix: '[B]' })
                .createLogger({ prefix: '[C]' });

            expect(
                logger['formatMessage']('debug', 'hello world')
            ).to.eql(`[${timestamp}][DEBUG] [A][B][C] hello world`);
        });

        it('includes colors when enabled', () => {
            logger.enableColors = true;
            expect(
                logger['formatMessage']('debug', 'hello world')
            ).to.eql(`[${chalk.grey(timestamp)}][${chalk.blue('DEBUG')}] hello world`);
        });
    });

    it('logLevel inherits from parent', () => {
        const child = logger.createLogger();
        logger.logLevel = 'trace';
        expect(child.logLevel).to.eql('trace');
        logger.logLevel = 'warn';
        expect(child.logLevel).to.eql('warn');
    });

    it('enableColors inherits from parent', () => {
        const child = logger.createLogger();
        logger.enableColors = true;
        expect(child.enableColors).to.be.true;
        logger.enableColors = false;
        expect(child.enableColors).to.be.false;
        //recovers when parent is missing
        child.parent = undefined;
        expect(child.enableColors).to.be.true;
    });

    it('enableConsole inherits from parent', () => {
        const child = logger.createLogger();
        logger.enableConsole = true;
        expect(child.enableConsole).to.be.true;
        logger.enableConsole = false;
        expect(child.enableConsole).to.be.false;
        //recovers when parent is missing
        child.parent = undefined;
        expect(child.enableConsole).to.be.true;
    });

    it('parent getter works', () => {
        const child = logger.createLogger();
        expect(child.parent).to.equal(logger);
        child.parent = undefined;
        expect(child.parent).to.be.undefined;
    });

    describe('subscribe', () => {
        it('only emits for the enabled logLevel', () => {
            logger.logLevel = 'warn';
            const spy = sinon.spy();
            logger.subscribe(spy);
            logger.log('not emitted');
            expect(spy.getCalls()).to.be.empty;

            logger.logLevel = 'log';
            logger.log('now emitted');
            expect(spy.getCalls()).not.to.be.empty;
        });

        it('allows unsubscribe', () => {
            logger.logLevel = 'warn';
            const spy = sinon.spy();
            const unsubscribe = logger.subscribe(spy);
            logger.warn('first warning');
            expect(spy.callCount).to.equal(1);
            unsubscribe();
            spy.resetHistory();
            logger.warn('second warning');
            expect(spy.callCount).to.equal(0);

            //no side-effects when unsubscribing multiple times
            unsubscribe();
        });
    });

    describe('getTimestamp', () => {
        it('returns a properly formatted time stamp', () => {
            sinon.restore();
            const stamp = logger['getTimestamp']();
            expect(/\d\d:\d\d:\d\d\.\d\d\d/.exec(stamp)).to.exist;
        });
    });

    describe('emit', () => {
        it('handles when options.subscribers is undefined', () => {
            logger['options'].subscribers = undefined as any;
            logger['emit']('message');
            //didn't crash, yay
        });

        it('emits to parents', () => {
            const parentSpy = sinon.spy();
            logger.subscribe(parentSpy);

            const child = logger.createLogger();
            const childSpy = sinon.spy();
            child.subscribe(childSpy);

            logger['emit']('parent message');
            expect(parentSpy.callCount).to.equal(1);
            expect(childSpy.callCount).to.equal(0);

            parentSpy.resetHistory();

            child['emit']('message');
            expect(parentSpy.callCount).to.equal(1);
            expect(childSpy.callCount).to.equal(1);
        });
    });

    describe('log methods call correct console method', () => {
        beforeEach(() => {
            logger.enableConsole = true;
            logger.logLevel = 'trace';
        });

        it('error', () => {
            const stub = sinon.stub(console, 'error').callsFake(() => { });
            logger.error('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });

        it('warn', () => {
            const stub = sinon.stub(console, 'warn').callsFake(() => { });
            logger.warn('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });

        it('log', () => {
            const stub = sinon.stub(console, 'log').callsFake(() => { });
            logger.log('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });

        it('info', () => {
            const stub = sinon.stub(console, 'info').callsFake(() => { });
            logger.info('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });

        it('debug', () => {
            const stub = sinon.stub(console, 'debug').callsFake(() => { });
            logger.debug('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });

        it('trace', () => {
            const stub = sinon.stub(console, 'trace').callsFake(() => { });
            logger.trace('hello world');
            expect(stub.getCalls()[0].args[0].endsWith('hello world'));
        });
    });

    describe('write', () => {

        it('defaults to "log" priority when missing', () => {
            let messages = [] as string[];
            logger.subscribe(message => {
                messages.push(message);
            });
            logger.write('CUSTOM' as LogLevel, 'hello world');
            expect(messages[0]).to.eql(`[${timestamp}][CUSTOM] hello world`);
        });

        it('skips writing to console when disabled', () => {
            const stub = sinon.stub(console, 'error').callsFake(() => { });
            logger.enableConsole = false;
            logger.write('error');
            expect(stub.callCount).to.eql(0);
        });

        it('only writes when', () => { });
    });

    describe('useLogger', () => {
        it('creates new child logger with distinct settings', () => {
            let innerLogger;
            logger.useLogger('child', l => {
                innerLogger = l;
                expect(l).not.to.equal(logger);
                logger.logLevel = 'trace';
                expect(l.logLevel).to.eql('trace');
                logger.logLevel = 'warn';
                expect(l.logLevel).to.eql('warn');
                l.logLevel = 'error';
                expect(l.logLevel).not.to.eql(logger.logLevel);
            });
            expect(innerLogger).to.exist;
        });

        it('returns the inner value', () => {
            let result = logger.useLogger({ prefix: 'child' }, () => {
                return 'bob';
            });
            expect(result).to.eql('bob');
        });
    });

    describe('sanitizeOptions', () => {
        it('forces logLevel to lower case', () => {
            const options = logger['sanitizeOptions']({
                logLevel: 'ERROR' as any
            });
            expect(options.logLevel).to.eql('error');
        });
    });

    it('LogLevelColors all work', () => {
        for (let key of Object.keys(LogLevelColor)) {
            //it shouldn't crash
            LogLevelColor[key]('');
        }
    });
});
