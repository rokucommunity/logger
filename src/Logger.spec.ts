import { expect } from 'chai';
import type { LogLevel, LogMessage } from './Logger';
import { Logger, LogLevelColor, LogLevelNumeric, chalk } from './Logger';
import { ConsoleTransport } from './transports/ConsoleTransport';
import { createSandbox } from 'sinon';
import { Stopwatch } from './Stopwatch';
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
        //disable chalk colors for this test
        chalk.level = 0;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('keeps logLevel in whatever format was originall provided', () => {
        logger.logLevel = LogLevelNumeric.debug;
        expect(logger.logLevel).to.eql(LogLevelNumeric.debug);

        logger.logLevel = 'info';
        expect(logger.logLevel).to.eql('info');
    });

    it('honors numeric logLevel when printing values', () => {
        logger.enableColor = false;
        const args: string[] = [];
        logger.addTransport({
            pipe: (message) => {
                args.push(message.argsText);
            }
        });
        logger.logLevel = LogLevelNumeric.log;
        logger.trace('trace1');
        logger.debug('debug1');
        logger.info('info1');
        logger.log('log1');
        logger.warn('warn1');
        logger.error('error1');
        expect(args).to.eql([
            'log1',
            'warn1',
            'error1'
        ]);
    });

    it('does not crash on bigint', () => {
        logger = new Logger();
        //should not throw
        expect(
            logger['buildLogMessage']('debug', {
                bigNumber: BigInt('123456789123456789')
            }).argsText
        ).to.eql('{"bigNumber":"123456789123456789"}');
    });

    it('uses LogLevel.log by default', () => {
        logger = new Logger();
        expect(logger.logLevel).to.eql('log');
    });

    it('supports logLevel in options using a number', () => {
        logger = new Logger({ logLevel: LogLevelNumeric.debug as any });
        expect(logger.logLevel).to.eql('debug');
    });

    it('supports logLevel setter using a number', () => {
        logger.logLevel = 'log';
        expect(logger.logLevel).to.eql('log');
        logger.logLevel = LogLevelNumeric.debug;
        expect(logger.logLevel).to.eql(LogLevelNumeric.debug);
    });

    it('getLogLevelNumeric works', () => {
        expect(logger.getLogLevelNumeric('trace')).to.eql(LogLevelNumeric.trace);
        expect(logger.getLogLevelNumeric('debug')).to.eql(LogLevelNumeric.debug);
        expect(logger.getLogLevelNumeric('info')).to.eql(LogLevelNumeric.info);
        expect(logger.getLogLevelNumeric('log')).to.eql(LogLevelNumeric.log);
        expect(logger.getLogLevelNumeric('warn')).to.eql(LogLevelNumeric.warn);
        expect(logger.getLogLevelNumeric('error')).to.eql(LogLevelNumeric.error);

        expect(logger.getLogLevelNumeric(LogLevelNumeric.trace)).to.eql(LogLevelNumeric.trace);
        expect(logger.getLogLevelNumeric(LogLevelNumeric.debug)).to.eql(LogLevelNumeric.debug);
        expect(logger.getLogLevelNumeric(LogLevelNumeric.info)).to.eql(LogLevelNumeric.info);
        expect(logger.getLogLevelNumeric(LogLevelNumeric.log)).to.eql(LogLevelNumeric.log);
        expect(logger.getLogLevelNumeric(LogLevelNumeric.warn)).to.eql(LogLevelNumeric.warn);
        expect(logger.getLogLevelNumeric(LogLevelNumeric.error)).to.eql(LogLevelNumeric.error);
    });

    it('getLogLevelString works', () => {
        expect(logger.getLogLevelText('trace')).to.eql('trace');
        expect(logger.getLogLevelText('debug')).to.eql('debug');
        expect(logger.getLogLevelText('info')).to.eql('info');
        expect(logger.getLogLevelText('log')).to.eql('log');
        expect(logger.getLogLevelText('warn')).to.eql('warn');
        expect(logger.getLogLevelText('error')).to.eql('error');

        expect(logger.getLogLevelText(LogLevelNumeric.trace)).to.eql('trace');
        expect(logger.getLogLevelText(LogLevelNumeric.debug)).to.eql('debug');
        expect(logger.getLogLevelText(LogLevelNumeric.info)).to.eql('info');
        expect(logger.getLogLevelText(LogLevelNumeric.log)).to.eql('log');
        expect(logger.getLogLevelText(LogLevelNumeric.warn)).to.eql('warn');
        expect(logger.getLogLevelText(LogLevelNumeric.error)).to.eql('error');
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

    it('consistentLogLevelWidth gets proper values', () => {
        const parent = logger;
        parent['options'].consistentLogLevelWidth = undefined;
        const child = parent.createLogger();
        child['options'].consistentLogLevelWidth = undefined;

        expect(child.consistentLogLevelWidth).to.eql(false);

        parent['options'].consistentLogLevelWidth = true;
        expect(child.consistentLogLevelWidth).to.eql(true);

        parent['options'].consistentLogLevelWidth = undefined;
        child['options'].consistentLogLevelWidth = true;
        expect(child.consistentLogLevelWidth).to.eql(true);

        parent['options'].consistentLogLevelWidth = true;
        child['options'].consistentLogLevelWidth = false;
        expect(child.consistentLogLevelWidth).to.eql(false);

        child.consistentLogLevelWidth = true;
        expect(child.consistentLogLevelWidth).to.eql(true);
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

    it('enableColor inherits from parent', () => {
        const child = logger.createLogger();
        logger.enableColor = false;
        expect(child.enableColor).to.eql(false);
        logger.enableColor = true;
        expect(child.enableColor).to.eql(true);
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

        it('uses from original options', () => {
            logger = new Logger({ timestampFormat: 'HH' });
            expect(
                logger.formatTimestamp(now)
            ).to.eql('04');
        });

        it('uses from parent options', () => {
            logger = new Logger({ timestampFormat: 'HH' });
            logger = logger.createLogger();
            expect(
                logger.formatTimestamp(now)
            ).to.eql('04');
        });

        it('uses the default when missing from options', () => {
            logger = new Logger();
            expect(
                logger.formatTimestamp(now)
            ).to.eql(timestamp);
        });

        it('uses the default when deleted from options', () => {
            logger = new Logger({ timestampFormat: 'HH' });
            logger['options'].timestampFormat = undefined;
            expect(
                logger.formatTimestamp(now)
            ).to.eql(timestamp);
        });

        it('uses the default when deleted from logger itself', () => {
            logger = new Logger({ timestampFormat: 'HH' });
            logger.timestampFormat = undefined;
            expect(
                logger.formatTimestamp(now)
            ).to.eql(timestamp);
        });

        it('supports the brighterscript log format', () => {
            logger.timestampFormat = 'hh:mm:ss:SSS aa';
            expect(logger.formatTimestamp(now)).to.eql('04:05:06:789 AM');
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

    describe('stringifyArgs', () => {
        it('handles most use cases', () => {
            expect(logger.stringifyArgs([undefined])).to.eql('undefined');
            expect(logger.stringifyArgs([null])).to.eql('null');
            expect(logger.stringifyArgs([false])).to.eql('false');
            expect(logger.stringifyArgs([1])).to.eql('1');
            expect(logger.stringifyArgs(['2'])).to.eql('2');
            expect(logger.stringifyArgs(['cat'])).to.eql('cat');
            expect(logger.stringifyArgs([{ name: 'bob' }])).to.eql('{"name":"bob"}');
            expect(logger.stringifyArgs([{}])).to.eql('{}');
            expect(logger.stringifyArgs([function () { }])).to.eql('function () { }');
            expect(logger.stringifyArgs([function named() { }])).to.eql('function named() { }');
            expect(
                logger.stringifyArgs([class Person { }]).split(/\r?\n/g).map(x => x.trim()).join('')
            ).to.eql('class Person {}');
        });

        it('serializes regexp', () => {
            expect(logger.stringifyArgs([/thing/])).to.eql('/thing/');
        });

        it('serializes Error objects', () => {
            const text = logger.stringifyArgs([new Error('crash baby crash')]);
            const parsed = JSON.parse(text);
            expect({
                name: parsed.name,
                message: parsed.message
            }).to.eql({
                name: 'Error',
                message: 'crash baby crash'
            });
        });
    });

    describe('formatLeadingMessageParts', () => {
        it(`honors the logger's enableColor setting`, () => {
            logger.enableColor = false;
            expect(
                logger.formatLeadingMessageParts(
                    logger.buildLogMessage('error', 'hello world')
                )
            ).to.eql(`[${timestamp}][ERROR]`);
        });

        it(`honors consistentLogLevelWidth`, () => {
            logger.enableColor = false;
            logger.consistentLogLevelWidth = true;
            expect(
                logger.formatLeadingMessageParts(
                    logger.buildLogMessage('log', 'hello world')
                )
            ).to.eql(`[${timestamp}][LOG  ]`);
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

        it('includes prefix with proper spacing', () => {
            logger = logger.createLogger('a').createLogger('b');
            const logMessage = logger.buildLogMessage('error', 'hello world');
            expect(
                logger.formatMessage(logMessage, false)
            ).to.eql(`[${timestamp}][ERROR] ab hello world`);
        });

        it('prints logLevel as a string even when using numeric logLevel', () => {
            logger = logger.createLogger('a').createLogger('b');
            const logMessage = logger.buildLogMessage(LogLevelNumeric.error, 'hello world');
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

        it('excludes logLevel when printLogLevel is false', () => {
            logger.printLogLevel = false;
            expect(
                logger.formatMessage(
                    logger.buildLogMessage('error', 'hello world'),
                    false
                )
            ).to.eql(`[${timestamp}] hello world`);
        });
    });

    it('logLevelColorWrap defaults to logLevel', () => {
        expect(
            logger['logLevelColorWrap']('[LOG]', 'log')
        ).to.eql(`[LOG]`);
    });

    describe('timeStart', () => {
        it('skips logging when logLevel is disabled', async () => {
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.logLevel = 'log';
            const stop = logger.timeStart('info', 'message');
            await sleep(10);
            stop();
            expect(stub.called).to.be.false;
        });

        it('logs when logLevel is enabled', async () => {
            sinon.stub(Stopwatch.prototype, 'getDurationText').callsFake(() => '10ms');
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.logLevel = 'info';
            const stop = logger.timeStart('info', 'message');
            await sleep(10);
            stop();
            expect(
                stub.getCalls().map(x => x.args)
            ).to.eql([
                ['info', 'message'],
                ['info', 'message', `finished. (10ms)`]
            ]);
        });

        it('honors the color setting', async () => {
            chalk.level = 3;
            sinon.stub(Stopwatch.prototype, 'getDurationText').callsFake(() => '10ms');
            const stub = sinon.stub(logger, 'write').callThrough();
            logger.logLevel = 'info';
            logger.enableColor = true;
            const stop = logger.timeStart('info', 'message');
            await sleep(10);
            stop();
            expect(
                stub.getCalls().map(x => x.args)
            ).to.eql([
                ['info', 'message'],
                ['info', 'message', `finished. (${chalk.blue('10ms')})`]
            ]);
        });
    });

    describe('time', () => {
        it('calls action even if logLevel is wrong', () => {
            logger.logLevel = 'error';
            const spy = sinon.spy();
            logger.time('info', [], spy);
            expect(spy.called).to.be.true;
        });

        it('runs timer when loglevel is right', () => {
            logger.logLevel = 'log';
            const spy = sinon.spy();
            logger.time('log', [], spy);
            expect(spy.called).to.be.true;
        });

        it('returns value', () => {
            logger.logLevel = 'log';
            const spy = sinon.spy(() => {
                return true;
            });
            expect(
                logger.time('log', [], spy)
            ).to.be.true;
            expect(spy.called).to.be.true;
        });

        it('gives callable pause and resume functions even when not running timer', () => {
            logger.time('info', [], (pause, resume) => {
                pause();
                resume();
            });
        });

        it('waits for and returns a promise when a promise is returned from the action', () => {
            expect(logger.time('log', ['message'], () => {
                return Promise.resolve();
            })).to.be.instanceof(Promise);
        });

        it('handles when messages is not defined', () => {
            expect(logger.time('log', undefined as any, () => {
                return Promise.resolve();
            })).to.be.instanceof(Promise);
        });
    });
});

async function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
