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
        it('returns non-error values unchanged', () => {
            expect(serializeError('hello')).to.eql('hello');
            expect(serializeError(42)).to.eql(42);
            const obj = { a: 1 };
            expect(serializeError(obj)).to.equal(obj);
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
