import {FileService} from "../../src/services/file.service";
import fs from "fs";
import {Logger} from "../../src/lib/logger"
import winston from "winston";
import {UploadedFile} from "../../src/constants/types";
// @ts-ignore
import uniqueFilename = require('unique-filename');

jest.mock('fs', () => ({
    unlink: jest.fn(),
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn()
}));


describe('fileService', () => {

    let fileService: FileService;
    let logger: winston.Logger;

    beforeAll(() => {
        logger = Logger.getLogger();
        fileService = new FileService();
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteFile', () => {

        const mockedUnlink = jest.mocked(fs.unlink);

        it('should delete file and log a message', () => {

            mockedUnlink.mockImplementationOnce((filename: any, callback: any) => {
                callback();
            });

            const loggerSpy = jest.spyOn(logger, 'info').mockReturnValue(({} as unknown) as winston.Logger);
            const filename = '/test_path.mov'

            fileService.deleteFile(filename)

            expect(fs.unlink).toBeCalledWith(filename, expect.any(Function));
            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith(`${filename} have been successfully removed.`);
        })

        it('should throw and log an error', async () => {

            mockedUnlink.mockImplementationOnce((filename: any, callback: any) => {
                callback(new Error());
            });
            const loggerSpy = jest.spyOn(logger, 'error').mockReturnValue(({} as unknown) as winston.Logger);
            const filename = './test_path.mov';

            expect(() => fileService.deleteFile(filename)).toThrowError();
            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith(`Error occurred while deleting file ${filename}`);

        })
    })

    describe('uploadFile', () => {

        const mockedReadFile = jest.mocked(fs.readFile);
        const mockedWriteFile = jest.mocked(fs.writeFile);
        let file: UploadedFile;

        beforeAll(() => {
            file = {
                fieldName: 'test',
                originalFilename: 'test_path.move',
                headers: {},
                path: '/tmp/test_path.mov',
                size: 9999,
                name: 'test_path.mov',
                type: 'video',

            }
        })

        it('should upload file', () => {

            mockedWriteFile.mockImplementationOnce((path: any, data: any, callback: any) => {
                callback();
            });
            mockedReadFile.mockImplementationOnce((path: any, callback: any) => {
                callback();
            });

            const newPath: string = fileService.uploadFile(file);

            expect(fs.readFile).toBeCalledWith(file.path, expect.any(Function));
            expect(fs.writeFile).toBeCalledWith(newPath, undefined, expect.any(Function));
        })

        it('readFile should throw an error', () => {


            mockedReadFile.mockImplementationOnce((path: any, callback: any) => {
                callback(new Error());
            });

            const loggerSpy = jest.spyOn(logger, 'error').mockReturnValue(({} as unknown) as winston.Logger);

            expect(() => fileService.uploadFile(file)).toThrowError();
            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith(`Error occurred while uploading file ${file.originalFilename}`);
        })

        it('writeFile should throw an error', () => {


            mockedReadFile.mockImplementationOnce((path: any, callback: any) => {
                callback();
            });
            mockedWriteFile.mockImplementationOnce((path: any, data: any, callback: any) => {
                callback(new Error());
            });
            const loggerSpy = jest.spyOn(logger, 'error').mockReturnValue(({} as unknown) as winston.Logger);

            expect(() => fileService.uploadFile(file)).toThrowError();
            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith(`Error occurred while uploading file ${file.originalFilename}`);
        })
    })


})
