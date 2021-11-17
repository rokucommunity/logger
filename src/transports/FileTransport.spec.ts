import { Logger } from '../Logger';
import { FileTransport } from './FileTransport';
import { createSandbox } from 'sinon';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { expect } from 'chai';
const sinon = createSandbox();

const cwd = process.cwd();
const tempDir = path.join(cwd, '.tmp');
const logPath = path.join(tempDir, 'test.log');

describe('FileTransport', () => {
    let transport: FileTransport;
    let logger: Logger;
    const now = new Date(
        2021, 2, 3,
        4, 5, 6, 789
    );
    const timestamp = '04:05:06.789';

    beforeEach(() => {
        fsExtra.emptyDirSync(tempDir);
        sinon.restore();
        sinon.stub(Logger.prototype as any, 'getCurrentDate').returns(now);
        transport = new FileTransport(logPath);
        logger = new Logger();
        logger.addTransport(transport);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('writes to file', () => {
        logger.log('hello world');
        expect(fsExtra.readFileSync(logPath).toString()).to.eql(`[${timestamp}][LOG] hello world\n`);
    });

    it('writes to file', () => {
        logger.log('hello world');
        expect(fsExtra.readFileSync(logPath).toString()).to.eql(`[${timestamp}][LOG] hello world\n`);
    });
});
