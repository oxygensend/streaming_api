import * as mongoose from "mongoose";
import {Logger} from "./logger";
import winston from "winston";
import {config} from "../config/config";

export class Database {

    private mongoose;
    private logger: winston.Logger;

    constructor() {
        this.mongoose = mongoose;
        this.logger = Logger.getLogger();
    }

    public async connect(): Promise<boolean> {
        const uri = config.db_url as string;
        try {
            await this.mongoose.connect(uri)
            this.logger.info("Connected to Mongodb: " + uri);
            return true;
        } catch (e) {
            this.logger.error('Connection to Mongodb: ' + uri + ' cannot be established ' + e);
            return false;
        }

    }

    public async disconnect() {
        await this.mongoose.connection.close((e) => {
            if (e) {
                this.logger.error(e)
                return false;
            } else {
                return true;
            }
        })
    }
}