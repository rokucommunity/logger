/**
 * Small, dependency-free helpers that replace several single-use npm packages.
 * Inlining these keeps the production dependency list at zero.
 */

/**
 * Serialize a value to JSON, gracefully handling circular references (which `JSON.stringify` throws on).
 * Replaces the `safe-json-stringify` package.
 *
 * @param value the value to stringify
 * @param replacer an optional replacer function, applied after circular references are stripped
 */
export function safeJsonStringify(
    value: unknown,
    replacer?: (key: string, value: any) => any
): string {
    const seen = new WeakSet();
    const safeReplacer = (key: string, val: any) => {
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val as object)) {
                return '[Circular]';
            }
            seen.add(val as object);
        }
        return replacer ? replacer(key, val) : val;
    };
    return JSON.stringify(value, safeReplacer);
}

/**
 * Convert an Error (or any value) into a plain, JSON-serializable object.
 * Replaces the `serialize-error` package for our use case (we only serialize for logging).
 *
 * Errors are converted to an object carrying their standard properties (`name`, `message`,
 * `stack`) plus any own enumerable properties. The `cause` (which is a non-enumerable property
 * in modern runtimes) is always included.
 *
 * Because a `cause` (or any custom field) may be a non-Error that *contains* an Error somewhere
 * inside it (e.g. `{ cause: { originalError: new Error(...) } }` or an array of errors), we
 * recurse through plain objects and arrays too, serializing any Errors we find along the way.
 * Primitives and non-plain objects (Date, RegExp, class instances, etc.) are returned as-is. A
 * `seen` set guards against circular references anywhere in the graph.
 */
export function serializeError(value: unknown, seen = new WeakSet<object>()): unknown {
    //primitives (and functions) can't hold nested errors or cycles; return them unchanged
    if (value === null || typeof value !== 'object') {
        return value;
    }

    //protect against circular references anywhere in the graph (cause chains, shared refs, etc.)
    if (seen.has(value)) {
        return '[Circular]';
    }
    seen.add(value);

    if (value instanceof Error) {
        const result: Record<string, unknown> = {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
        //`cause` is a non-enumerable own property, so it won't be caught by the Object.keys loop below.
        //Include it explicitly and serialize it recursively (it may be an Error, or contain one).
        if ('cause' in value) {
            result.cause = serializeError((value as { cause?: unknown }).cause, seen);
        }
        //copy any additional own enumerable properties (e.g. custom error fields)
        for (const key of Object.keys(value)) {
            if (!(key in result)) {
                result[key] = serializeError((value as any)[key], seen);
            }
        }
        return result;
    }

    //recurse into arrays so nested Errors within them get serialized
    if (Array.isArray(value)) {
        return value.map(item => serializeError(item, seen));
    }

    //only recurse into plain objects; leave exotic objects (Date, RegExp, Map, class instances,
    //etc.) untouched so we don't mangle values the caller expected to pass through verbatim
    const proto = Object.getPrototypeOf(value);
    if (proto === Object.prototype || proto === null) {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            result[key] = serializeError((value as any)[key], seen);
        }
        return result;
    }

    //non-plain object with no Error inside our reach; return as-is
    return value;
}

export interface ParsedMilliseconds {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    microseconds: number;
    nanoseconds: number;
}

/**
 * Break a millisecond duration into its time-unit parts.
 * Replaces the `parse-ms` package.
 */
export function parseMilliseconds(milliseconds: number): ParsedMilliseconds {
    const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
    return {
        days: roundTowardsZero(milliseconds / 86400000),
        hours: roundTowardsZero(milliseconds / 3600000) % 24,
        minutes: roundTowardsZero(milliseconds / 60000) % 60,
        seconds: roundTowardsZero(milliseconds / 1000) % 60,
        milliseconds: roundTowardsZero(milliseconds) % 1000,
        microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
        nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
    };
}

/**
 * Format a Date using a small subset of the date-fns format tokens that this library supports.
 * Replaces the `date-fns` package's `format()` function.
 *
 * Supported tokens (longest-match-first):
 *  - `HH`  24-hour, zero-padded (00-23)
 *  - `H`   24-hour (0-23)
 *  - `hh`  12-hour, zero-padded (01-12)
 *  - `h`   12-hour (1-12)
 *  - `mm`  minutes, zero-padded
 *  - `m`   minutes
 *  - `ss`  seconds, zero-padded
 *  - `s`   seconds
 *  - `SSS` milliseconds, zero-padded to 3 digits
 *  - `aa`  AM/PM (uppercase)
 *
 * Any characters that aren't a recognized token are emitted literally.
 */
export function formatTimestamp(date: Date, formatString: string): string {
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const pad = (value: number, length = 2) => value.toString().padStart(length, '0');

    //tokens must be ordered longest-first so e.g. `HH` is matched before `H`
    const tokens: Array<[string, () => string]> = [
        ['SSS', () => pad(date.getMilliseconds(), 3)],
        ['HH', () => pad(hours24)],
        ['hh', () => pad(hours12)],
        ['mm', () => pad(date.getMinutes())],
        ['ss', () => pad(date.getSeconds())],
        ['aa', () => (hours24 < 12 ? 'AM' : 'PM')],
        ['H', () => hours24.toString()],
        ['h', () => hours12.toString()],
        ['m', () => date.getMinutes().toString()],
        ['s', () => date.getSeconds().toString()]
    ];

    let result = '';
    let i = 0;
    outer: while (i < formatString.length) {
        for (const [token, getValue] of tokens) {
            if (formatString.startsWith(token, i)) {
                result += getValue();
                i += token.length;
                continue outer;
            }
        }
        //not a recognized token; emit the character literally
        result += formatString[i];
        i++;
    }
    return result;
}
