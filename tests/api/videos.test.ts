import {IVideo, Video} from "../../src/models/video.model";
import * as Buffer from "buffer";
import {config} from "../../src/config/config";
import supertest from 'supertest';
import {HTTP_CODES} from "../../src/constants/http.codes";
import {Server} from "../../src/lib/server";
import fs from 'fs';
import {FileService} from "../../src/services/file.service";
import {Types} from "mongoose";
import {Readable} from "stream";
import {AwsService} from "../../src/services/aws.service";
import {UploadedFile} from "../../src/constants/types";
import {v4 as uuidv4} from 'uuid';


describe("/api/videos", () => {

    let request: supertest.SuperTest<supertest.Test>;
    let server: Server;
    const fsReal = jest.requireActual("fs");

    beforeAll(async () => {
        server = Server.getInstance();
        server.run();
        request = supertest(server.getApp());
    })


    describe('GET /', () => {

        beforeAll(async () => {
            let rawJson: Buffer = fsReal.readFileSync(config.testDirectory + '/dummy/videos.json');
            let videos: [] = JSON.parse(rawJson.toString());
            await Video.collection.insertMany(videos);
        })

        afterAll(async () => {
            await Video.deleteMany();
        })

        it('should return all existing videos', async () => {
            const res = await request.get('/videos');
            expect(res.status).toBe(HTTP_CODES.SUCCESS);
            expect(res.body.data.length).toBe(10);
        })

        it('should return all necessary variables', async () => {
            const res = await request.get('/videos');
            expect(Object.keys(res.body)).toEqual(['data', 'count', 'page', 'limit']);
        })

        it('video fields', async () => {
            const res = await request.get('/videos');
            const video = res.body.data[0];
            expect(Object.keys(video)).toEqual(['_id', 'title']);
        })

        it('pagination limit parameter', async () => {
            const res = await request.get('/videos?limit=2&page=1');
            expect(res.body.data.length).toBe(2);
        })

        it('pagination page parameter', async () => {
            const res = await request.get('/videos?limit=2&page=2');
            expect(res.body.data.length).toBe(2);
        })
    })

    describe('GET /:id', () => {

        it('should return 404 when video doesnt exists', async () => {
            const res = await request.get('/videos/' + new Types.ObjectId);
            expect(res.status).toBe(HTTP_CODES.NOT_FOUND);
        })

        it('should return nearly created video', async () => {

            const video: IVideo = await Video.create({
                title: "Test_video",
                originalName: "test_Record.mov",
                bytes: 464518,
                path: "/app/2e33e281.mov",
                duration: 2,
                s3Key: '123-123-123'
            });
            const res = await request.get('/videos/' + video._id);
            await Video.deleteMany();

            expect(res.status).toBe(HTTP_CODES.SUCCESS);
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['_id', 'title', 'originalName', 'bytes', 'duration', 'path', 'createdAt'])
            );
        })

    })

    describe('DELETE /:id', () => {


        afterAll(() => {
            jest.resetAllMocks();
        })


        it('should return 404 when video doesnt exists', async () => {
            const res = await request.delete('/videos/' + new Types.ObjectId);
            expect(res.status).toBe(HTTP_CODES.NOT_FOUND);
        })

        it('should delete video', async () => {

            jest.spyOn(fs, 'unlink').mockImplementationOnce((
                filename: any, callback: any) => {
                callback(null);
            });
            jest.spyOn(AwsService.prototype, 'removeFileFromS3').mockImplementationOnce((s3Key: string) => {
            });

            const video: IVideo = await Video.create({
                title: "Test_video",
                originalName: "test_Record.mov",
                bytes: 464518,
                path: "/app/2e33e281.mov",
                duration: 2,
                s3Id: '123-123-123'
            });

            const res = await request.delete('/videos/' + video._id);
            const videoFromDB = await Video.findById(video._id);

            expect(res.status).toBe(HTTP_CODES.NO_CONTENT);
            expect(videoFromDB).toBe(null);
        })
    })

    describe('PATCH /:id', () => {

        //TODO valdation

        let video: IVideo;

        beforeEach(async () => {
            video = await Video.create({
                title: "Test_video",
                originalName: "test_Record.mov",
                bytes: 464518,
                path: "/app/2e33e281.mov",
                duration: 2,
                s3Id: '123-123-123-123'
            });
        })
        afterEach(async () => {
            await Video.deleteMany();
        })

        it('return 404 when video doesnt exists', async () => {
            const res = await request.patch('/videos/' + new Types.ObjectId);
            expect(res.status).toBe(HTTP_CODES.NOT_FOUND);
        })

        it('return 400 when title is missing', async () => {
            const res = await request
                .patch('/videos/' + video._id)
                .send({});

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
        })

        it('return 400 when title has too few characters', async () => {
            const res = await request
                .patch('/videos/' + video._id)
                .send({title: 'nn'});

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
        })

        it('return 400 when title has to many characters', async () => {
            const res = await request
                .patch('/videos/' + video._id)
                .send({title: 'n'.repeat(51)});

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
        })

        it('update video data', async () => {

            const res = await request
                .patch('/videos/' + video._id)
                .send({title: 'new_title'});

            const videoFromDB = await Video.findById(video._id);

            expect(res.status).toBe(HTTP_CODES.SUCCESS);
            expect(videoFromDB?.title).toBe('new_title');

        })
    })

    describe('POST /', () => {

        let filePath = './test.mov';
        let filePathWrong = './test.jpg';

        beforeAll(() => {
            const fileContents = new Uint8Array(10);
            fsReal.writeFileSync(filePath, fileContents);
            fsReal.writeFileSync(filePathWrong, fileContents);

            jest.spyOn(fs, 'writeFile').mockImplementationOnce((path: any, data: any, callback: any) => {
                callback();
            });
            jest.spyOn(fs, 'readFile').mockImplementationOnce((path: any, callback: any) => {
                callback();
            });
            jest.spyOn(AwsService.prototype, 'uploadFileToS3').mockImplementationOnce((file: UploadedFile) => {
                return uuidv4();
            });
            jest.spyOn(FileService.prototype, 'getVideoDuration')
                .mockImplementation((filePath: string): Promise<number> => new Promise((resolve, reject) => resolve(10)));

        });

        afterAll(() => {
            fsReal.unlinkSync(filePath);
            fsReal.unlinkSync(filePathWrong);

            jest.resetAllMocks();
        });

        it('return 400 when body is empty', async () => {

            const res = await request
                .post('/videos');

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    title: 'Field `title` is required',
                    file: 'Field `file` is required'
                }
            })
        })

        it('return 400 when file is missing', async () => {

            const res = await request
                .post('/videos')
                .field('title', 'test_title');

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    file: 'Field `file` is required'
                }
            })
        })

        it('return 400 when title is missing', async () => {


            const res = await request
                .post('/videos')
                .attach('file', filePath);

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    title: 'Field `title` is required'
                }
            });
        })

        it('return 400 when title has too few characters', async () => {

            const res = await request
                .post('/videos')
                .field('title', 'nn')
                .attach('file', filePath);

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    title: "Length of fields `title` must ranges between 3 and 50 characters"
                }
            });
        })

        it('return 400 when title has to many characters', async () => {

            const res = await request
                .post('/videos')
                .field('title', 'n'.repeat(51))
                .attach('file', filePath);

            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    title: "Length of fields `title` must ranges between 3 and 50 characters"
                }
            });
        })

        it('return 400 when file is in not acceptable format', async () => {

            const res = await request
                .post('/videos')
                .field('title', 'test_title')
                .attach('file', filePathWrong);


            expect(res.status).toBe(HTTP_CODES.BAD_REQUEST);
            expect(res.body.error).toStrictEqual({
                violations: {
                    file: "Valid file format. Allowed formats are: [ video/mp4,video/x-flv,video/x-ms-wmv,video/x-msvideo,video/quicktime ]"
                }
            })
        })

        it('create video', async () => {

            const res = await request
                .post('/videos')
                .field('title', 'test_title')
                .attach('file', filePath);

            const videoFromDB = await Video.findById(res.body._id);

            expect(res.status).toBe(HTTP_CODES.CREATED);
            expect(videoFromDB).not.toBeNull();
        })
    })


    describe('GET /:id/stream', () => {

        let video: IVideo;

        beforeEach(async () => {
            video = await Video.create({
                title: "Test_video",
                originalName: "test_Record.mov",
                bytes: 464518,
                path: "/app/2e33e281.mov",
                duration: 2,
                s3Id: '123-123-123-123'
            });

            // @ts-ignore
            jest.spyOn(fs, 'createReadStream').mockImplementationOnce((path: any, options?: any) => {
                return new Readable();
            });
        })
        afterEach(async () => {
            await Video.deleteMany();
        })


        it('return 404 when video doesnt exists', async () => {
            const res = await request.get('/videos/' + new Types.ObjectId + '/stream');
            expect(res.status).toBe(HTTP_CODES.NOT_FOUND);
        })

        it('return 500 when range header is missing', async () => {
            const res = await request
                .get('/videos/' + video._id + '/stream');


            expect(res.status).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
        })

        it('return 206 response when everythink is OK ', async () => {


            // TODO FIX
            const res = await request
                .get('/videos/' + video._id + '/stream')
                .set({'Range': 'bytes=0-1'});

            expect(res.status).toBe(HTTP_CODES.PARTIAL_CONTENT);
        })
    })

})