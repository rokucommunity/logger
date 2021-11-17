import { expect } from 'chai';
import type { LogLevel, LogMessage } from './Logger';
import { Logger, LogLevelColor } from './Logger';
import { createSandbox } from 'sinon';
const sinon = createSandbox();

describe('Logger', () => {
    let logger: Logger;
    const now = new Date(
        2021, 2, 3,
        4, 5, 6, 789
    );
    const timestamp = '04:05:06.789';

    beforeEach(() => {
        sinon.restore();
        sinon.stub(Logger.prototype as any, 'getCurrentDate').returns(now);
        logger = new Logger();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('uses LogLevel.log by default', () => {
        logger = new Logger();
        expect(logger.logLevel).to.eql('log');
    });

    describe('createLogMessage', () => {
        it('works', () => {
            expect(
                logger['buildLogMessage']('debug', 'hello world', 1)
            ).to.eql({
                args: ['hello world', 1],
                argsText: 'hello world 1',
                date: now,
                logLevel: 'debug',
                logger: logger,
                prefixes: [],
                timestamp: timestamp
            } as LogMessage);
        });

        it('supports nested prefixes', () => {
            logger = logger
                .createLogger({ prefix: '[A]' })
                .createLogger({ prefix: '[B]' })
                .createLogger({ prefix: '[C]' });

            expect(
                logger['getPrefixes']()
            ).to.eql([
                '[A]',
                '[B]',
                '[C]'
            ]);
        });
    });

    describe('createLogger', () => {
        it('supports string prefix param', () => {
            const childLogger = logger.createLogger('child');
            expect(childLogger['prefix']).to.eql('child');
        });
    });

    it('logLevel inherits from parent', () => {
        const child = logger.createLogger();
        logger.logLevel = 'trace';
        expect(child.logLevel).to.eql('trace');
        logger.logLevel = 'warn';
        expect(child.logLevel).to.eql('warn');
    });

    it('parent getter works', () => {
        const child = logger.createLogger();
        expect(child.parent).to.equal(logger);
        child.parent = undefined;
        expect(child.parent).to.be.undefined;
    });

    it('allows setting and clearing prefix', () => {
        logger.prefix = undefined;
        expect(logger.prefix).to.be.undefined;
        logger.prefix = 'SomeModule';
        expect(logger.prefix).to.eql('SomeModule');
    });

    it('fetches transports', () => {
        logger = new Logger();
        expect(logger.transports).to.be.empty;
        logger.subscribe(() => { });
        expect(logger.transports).not.to.be.empty;
    });

    it('getCurrentDate returns a date', () => {
        sinon.restore();
        expect(
            logger['getCurrentDate']()
        ).to.be.instanceof(Date);
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
            const stamp = logger.formatTimestamp(new Date());
            expect(/\d\d:\d\d:\d\d\.\d\d\d/.exec(stamp)).to.exist;
        });
    });

    describe('emit', () => {
        it('handles when options.transports is undefined', () => {
            logger['options'].transports = undefined as any;
            logger['emit'](logger['buildLogMessage']('log', 1, 2, 3));
            //didn't crash, yay
        });

        it('emits to parents', () => {
            const parentSpy = sinon.spy();
            logger.subscribe(parentSpy);

            const child = logger.createLogger();
            const childSpy = sinon.spy();
            child.subscribe(childSpy);

            logger.log('message1');
            expect(parentSpy.callCount).to.equal(1);
            expect(childSpy.callCount).to.equal(0);

            parentSpy.resetHistory();

            child.log('message2');
            expect(parentSpy.callCount).to.equal(1);
            expect(childSpy.callCount).to.equal(1);
        });
    });

    describe('log methods call correct console method', () => {
        beforeEach(() => {
            logger.logLevel = 'trace';
            logger.transports = [];
        });

        it('error', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.error('hello world');
            expect(stub.getCalls()[0].args).eql(['error', 'hello world']);
        });

        it('warn', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.warn('hello world');
            expect(stub.getCalls()[0].args).eql(['warn', 'hello world']);
        });

        it('log', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.log('hello world');
            expect(stub.getCalls()[0].args).eql(['log', 'hello world']);
        });

        it('info', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.info('hello world');
            expect(stub.getCalls()[0].args).eql(['info', 'hello world']);
        });

        it('debug', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.debug('hello world');
            expect(stub.getCalls()[0].args).eql(['debug', 'hello world']);
        });

        it('trace', () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.trace('hello world');
            expect(stub.getCalls()[0].args).eql(['trace', 'hello world']);
        });
    });

    describe('write', () => {
        it('defaults to "log" priority when missing', () => {
            let messages = [] as LogMessage[];
            logger.subscribe(message => {
                messages.push(message);
            });
            logger.write('CUSTOM' as LogLevel, 'hello world');
            expect(messages[0].logLevel).to.eql('CUSTOM');
        });
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

        it('forces logLevel to lower case', () => {
            const options = logger['sanitizeOptions']('thePrefix');
            expect(options.prefix).to.eql('thePrefix');
        });
    });

    describe('destroy', () => {
        it('calls destroy on all transports', () => {
            const spy = sinon.spy();
            logger.transports.push({
                pipe: () => { },
                destroy: spy
            });
            logger.destroy();
            expect(spy.callCount).to.eql(1);
        });

        it('does not crash on invalid transport', () => {
            logger.transports.push({
                pipe: () => { }
            }, undefined as any);
            logger.destroy();
        });

        it('does not crash when called twice', () => {
            logger.destroy();
            logger.destroy();
        });

        it('does not crash when options gets deleted', () => {
            logger['options'] = undefined as any;
            logger.destroy();
        });
    });

    describe('formatLogMessage', () => {

        it('defaults to "log" color when unknown', () => {
            const stub = sinon.stub(LogLevelColor, 'log');
            logger.formatMessage(
                logger.buildLogMessage('CUSTOM' as any, 'hello world'),
                true
            );
            expect(stub.called).to.be.true;
        });

        it('includes prefix with proper spacing', () => {
            logger = logger.createLogger('a').createLogger('b');
            const logMessage = logger.buildLogMessage('error', 'hello world');
            expect(
                logger.formatMessage(logMessage, false)
            ).to.eql(`[${timestamp}][ERROR] ab hello world`);
        });

        it('LogLevelColors all work', () => {
            for (let key of Object.keys(LogLevelColor)) {
                //it shouldn't crash
                LogLevelColor[key]('');
            }
        });

        it('excludes color when disabled', () => {
            expect(
                logger.formatMessage(
                    logger.buildLogMessage('error', 'hello world'),
                    false
                )
            ).to.eql(`[${timestamp}][ERROR] hello world`);
        });
    });
});
