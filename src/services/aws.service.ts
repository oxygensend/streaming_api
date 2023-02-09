import {Service} from "typedi";
import {UploadedFile} from "../constants/types";
import {Credentials, S3} from "aws-sdk";
import {config} from "../config/config";
import fs from "fs";
import winston from "winston";
import {Logger} from "../lib/logger";
import {extname} from "path";
import {v4 as uuidv4} from 'uuid';
import {S3Stream} from "../stream/s3.stream";
import {HttpExceptions} from "../exceptions/exceptions";

@Service()
export class AwsService {

    private readonly S3Client: S3;
    private logger: winston.Logger;

    constructor() {
        this.S3Client = new S3({
            apiVersion: 'latest',
            credentials: new Credentials(config.aws_access_key_id, config.aws_secret_access_key),
            region: config.aws_region,

        });
        this.logger = Logger.getLogger();
    }


    public uploadFileToS3(file: UploadedFile): string {

        const fileStream = fs.createReadStream(file.path);
        const fileExtension: string = extname(file.originalFilename);
        const fileKey: string = uuidv4() + fileExtension;

        const uploadParams = {
            Bucket: config.aws_bucket,
            Key: fileKey,
            Body: fileStream
        };

        this.S3Client.upload(uploadParams, (err: any, data: any) => {
            if (err) {
                throw err;
            } else {
                this.logger.info(data);
            }
        })

        return fileKey;

    }

    public removeFileFromS3(s3Key: string) {

        this.S3Client.deleteObject({
            Bucket: config.aws_bucket,
            Key: s3Key
        }, (err: any, data: any) => {
            if (err) {
                throw  err;
            } else {
                this.logger.info(data);
            }
        })

    }

    public async createS3Stream(s3Key: string): Promise<S3Stream> {
        return new Promise((resolve, reject) => {

            try {
                const params = {
                    Bucket: config.aws_bucket,
                    Key: s3Key
                };

                this.S3Client.headObject(params, (error, data) => {
                    if (error) {
                        throw error;
                    }
                    // After getting the data we want from the call to s3.headObject
                    // We have everything we need to instantiate our SmartStream class
                    // If you want to pass ReadableOptions to the Readable class, you pass the object as the fourth parameter
                    const stream = new S3Stream(params, this.S3Client, data.ContentLength as number);

                    resolve(stream);
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    public getSignedUrl(s3Key: string) {
        let params = {Bucket: config.aws_bucket, Key: s3Key, Expires: 60};
        return this.S3Client.getSignedUrl('getObject', params);
    }

}