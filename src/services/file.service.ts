import fs from "fs";
import {config} from "../config/config";
// @ts-ignore
import uniqueFilename = require('unique-filename');
import {extname} from "path";
import {Service} from "typedi";
import {UploadedFile} from "../constants/types";
import winston from "winston";
import {Logger} from "../lib/logger";

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
            const newDirectory: string = `${config.rootDirectory}/${config.storageDirectory}`;
            const newPath: string = uniqueFilename(newDirectory) + fileExtension;

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

        try {
            fs.unlink(filePath, (err) => {
                if (err) throw err;
                this.logger.info(`${filePath} have been successfully removed.`)
            });
        } catch (err) {
            this.logger.error("Error occurred while deleting file " + filePath);
            throw err;
        }
    }
}