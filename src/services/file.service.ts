import fs from "fs";
import {config} from "../config/config";
// @ts-ignore
import uniqueFilename = require('unique-filename');
import {extname} from "path";
import {Service} from "typedi";
import {UploadedFile} from "../constants/types";
import winston from "winston";
import {Logger} from "../lib/logger";
import {execFile} from "child_process";

@Service()
export class FileService {

    private readonly logger: winston.Logger;

    public constructor() {
        this.logger = Logger.getLogger();
    }

    /**
     * Handle file uploading from multipart requests
     */
    public uploadFile(file: UploadedFile): string {

        try {
            const fileExtension: string = extname(file.originalFilename);
            const newPath: string = uniqueFilename(config.storageDirectory) + fileExtension;

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;

                fs.writeFile(newPath, data, (err) => {
                    if (err) throw err;

                });

            });

            return newPath;

        } catch (err) {
            this.logger.error("Error occurred while uploading file " + file.originalFilename);
            throw err;
        }

    }

    public deleteFile(filePath: string) {

        fs.unlink(filePath, (err) => {
            if (err) {
                this.logger.error("Error occurred while deleting file " + filePath);
                throw err;
            }
            this.logger.info(`${filePath} have been successfully removed.`)
        });
    }


    async getVideoDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            execFile('ffprobe', [
                '-v',
                'error',
                '-show_entries',
                'format=duration',
                '-of',
                'default=noprint_wrappers=1:nokey=1',
                filePath
            ], (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    reject(error);
                } else {
                    const duration = parseFloat(stdout);
                    resolve(duration);
                }
            });
        });
    }
}