import * as mongoose from "mongoose";
import {logger} from "../logger/logger";

export class Database {

    private mongoose;

    constructor() {
        this.mongoose = mongoose;
    }

    public async connect(): Promise<boolean> {
        const uri = process.env["MONGODB_URI"] as string;
        try {
            await this.mongoose.connect(uri)
            logger.info("Connected to Mongodb: " + uri);
            return true;
        } catch (e) {
            logger.error('Connection to Mongodb: ' + uri + ' cannot be established ' + e);
            return false;
        }

    }

    public disconnect() {
        this.mongoose.connection.close((e) => {
            if (e) {
                logger.error(e)
                return false;
            } else {
                return true;
            }
        })
    }
}