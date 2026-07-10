import { expect } from 'chai';
import { safeJsonStringify, serializeError, parseMilliseconds, formatTimestamp } from './util';

describe('util', () => {
    describe('safeJsonStringify', () => {
        it('stringifies plain objects', () => {
            expect(safeJsonStringify({ a: 1, b: 'two' })).to.eql('{"a":1,"b":"two"}');
        });

        it('handles circular references', () => {
            const obj: any = { name: 'root' };
            obj.self = obj;
            expect(safeJsonStringify(obj)).to.eql('{"name":"root","self":"[Circular]"}');
        });

        it('applies the replacer function', () => {
            const result = safeJsonStringify({ value: 10n as unknown }, (_, value) => {
                return typeof value === 'bigint' ? value.toString() : value;
            });
            expect(result).to.eql('{"value":"10"}');
        });
    });

    describe('serializeError', () => {
        it('returns primitive values unchanged', () => {
            expect(serializeError('hello')).to.eql('hello');
            expect(serializeError(42)).to.eql(42);
            expect(serializeError(null)).to.eql(null);
            expect(serializeError(undefined)).to.eql(undefined);
            expect(serializeError(true)).to.eql(true);
        });

        it('returns an equivalent (deep) copy of plain objects/arrays', () => {
            expect(serializeError({ a: 1 })).to.eql({ a: 1 });
            expect(serializeError([1, 2, 3])).to.eql([1, 2, 3]);
        });

        it('leaves exotic (non-plain) objects untouched', () => {
            const date = new Date();
            expect(serializeError(date)).to.equal(date);
            const re = /thing/;
            expect(serializeError(re)).to.equal(re);
        });

        it('serializes the standard error properties', () => {
            const error = new Error('boom');
            const result = serializeError(error) as Record<string, unknown>;
            expect(result.name).to.eql('Error');
            expect(result.message).to.eql('boom');
            expect(result.stack).to.be.a('string');
        });

        it('copies custom own enumerable properties', () => {
            const error = new Error('boom') as any;
            error.code = 'E_BOOM';
            const result = serializeError(error) as Record<string, unknown>;
            expect(result.code).to.eql('E_BOOM');
        });

        it('does not let custom properties clobber the standard ones', () => {
            const error = new Error('boom') as any;
            //define an own-enumerable `message` so it collides with the standard property
            Object.defineProperty(error, 'message', { value: 'boom', enumerable: true });
            const result = serializeError(error) as Record<string, unknown>;
            expect(result.message).to.eql('boom');
        });

        it('serializes a non-error cause', () => {
            const error = new Error('boom', { cause: 'the underlying reason' });
            const result = serializeError(error) as Record<string, unknown>;
            expect(result.cause).to.eql('the underlying reason');
        });

        it('recursively serializes an Error cause', () => {
            const cause = new Error('root cause') as any;
            cause.code = 'E_ROOT';
            const error = new Error('boom', { cause });
            const result = serializeError(error) as Record<string, unknown>;
            const serializedCause = result.cause as Record<string, unknown>;
            expect(serializedCause.name).to.eql('Error');
            expect(serializedCause.message).to.eql('root cause');
            expect(serializedCause.stack).to.be.a('string');
            expect(serializedCause.code).to.eql('E_ROOT');
        });

        it('serializes a deeply nested cause chain', () => {
            const level3 = new Error('level 3');
            const level2 = new Error('level 2', { cause: level3 });
            const level1 = new Error('level 1', { cause: level2 });
            const result = serializeError(level1) as any;
            expect(result.message).to.eql('level 1');
            expect(result.cause.message).to.eql('level 2');
            expect(result.cause.cause.message).to.eql('level 3');
        });

        it('serializes a cause that was assigned as a custom (enumerable) property', () => {
            const cause = new Error('root cause');
            const error = new Error('boom') as any;
            //assign cause after construction; it becomes an own-enumerable property
            error.cause = cause;
            const result = serializeError(error) as any;
            expect(result.cause.name).to.eql('Error');
            expect(result.cause.message).to.eql('root cause');
        });

        it('does not throw on a circular cause chain', () => {
            const a = new Error('a') as any;
            const b = new Error('b') as any;
            a.cause = b;
            b.cause = a;
            const result = serializeError(a) as any;
            expect(result.message).to.eql('a');
            expect(result.cause.message).to.eql('b');
            //the loop back to `a` is broken with a marker
            expect(result.cause.cause).to.eql('[Circular]');
        });

        it('does not throw on a self-referencing cause', () => {
            const error = new Error('boom') as any;
            error.cause = error;
            const result = serializeError(error) as any;
            expect(result.message).to.eql('boom');
            expect(result.cause).to.eql('[Circular]');
        });

        it('produces JSON-serializable output for a cause chain', () => {
            const error = new Error('boom', { cause: new Error('root cause') });
            expect(() => JSON.stringify(serializeError(error))).to.not.throw();
            const parsed = JSON.parse(JSON.stringify(serializeError(error)));
            expect(parsed.cause.message).to.eql('root cause');
        });

        it('serializes an Error nested inside an object cause', () => {
            const error = new Error('boom', {
                cause: { originalError: new Error('root cause'), context: 'fetch' }
            });
            const result = serializeError(error) as any;
            expect(result.cause.context).to.eql('fetch');
            expect(result.cause.originalError.name).to.eql('Error');
            expect(result.cause.originalError.message).to.eql('root cause');
            expect(result.cause.originalError.stack).to.be.a('string');
        });

        it('serializes Errors nested inside an array cause', () => {
            const error = new Error('boom', {
                cause: [new Error('first'), new Error('second')]
            });
            const result = serializeError(error) as any;
            expect(result.cause).to.be.an('array');
            expect(result.cause[0].message).to.eql('first');
            expect(result.cause[1].message).to.eql('second');
        });

        it('serializes Errors nested inside custom error fields', () => {
            const error = new Error('boom') as any;
            error.details = { errors: [new Error('inner')] };
            const result = serializeError(error) as any;
            expect(result.details.errors[0].message).to.eql('inner');
        });

        it('serializes deeply nested Errors within objects', () => {
            const error = new Error('boom', {
                cause: { a: { b: { c: new Error('deep') } } }
            });
            const result = serializeError(error) as any;
            expect(result.cause.a.b.c.message).to.eql('deep');
        });

        it('does not throw on a circular plain-object cause', () => {
            const obj: any = { name: 'ctx' };
            obj.self = obj;
            const error = new Error('boom', { cause: obj });
            const result = serializeError(error) as any;
            expect(result.cause.name).to.eql('ctx');
            expect(result.cause.self).to.eql('[Circular]');
        });

        it('produces JSON-serializable output for an object cause with a circular ref', () => {
            const obj: any = { context: 'x' };
            obj.loop = obj;
            const error = new Error('boom', { cause: obj });
            expect(() => JSON.stringify(serializeError(error))).to.not.throw();
        });
    });

    describe('parseMilliseconds', () => {
        it('breaks out the time units', () => {
            const parts = parseMilliseconds(((2 * 60) + 3) * 1000 + 456);
            expect(parts.minutes).to.eql(2);
            expect(parts.seconds).to.eql(3);
            expect(parts.milliseconds).to.eql(456);
        });

        it('handles negative durations', () => {
            const parts = parseMilliseconds(-1500);
            expect(parts.seconds).to.eql(-1);
            expect(parts.milliseconds).to.eql(-500);
        });
    });

    describe('formatTimestamp', () => {
        const date = new Date(2021, 2, 3, 4, 5, 6, 789);

        it('formats the default token set', () => {
            expect(formatTimestamp(date, 'HH:mm:ss.SSS')).to.eql('04:05:06.789');
        });

        it('formats 12-hour time with AM/PM', () => {
            expect(formatTimestamp(date, 'hh:mm:ss:SSS aa')).to.eql('04:05:06:789 AM');
        });

        it('uses PM for afternoon and 12 for noon', () => {
            const noon = new Date(2021, 2, 3, 12, 30, 0, 0);
            expect(formatTimestamp(noon, 'hh:mm aa')).to.eql('12:30 PM');
        });

        it('uses 12 for midnight in 12-hour format', () => {
            const midnight = new Date(2021, 2, 3, 0, 30, 0, 0);
            expect(formatTimestamp(midnight, 'hh:mm aa')).to.eql('12:30 AM');
        });

        it('supports single-character tokens', () => {
            const single = new Date(2021, 2, 3, 4, 5, 6, 7);
            expect(formatTimestamp(single, 'H:h:m:s')).to.eql('4:4:5:6');
        });

        it('emits unrecognized characters literally', () => {
            expect(formatTimestamp(date, '[HH]')).to.eql('[04]');
        });
    });
});
