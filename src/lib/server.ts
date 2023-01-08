import express, {Application} from "express";
import {Database} from "./database";
import {Routes} from "./routes";
import {Logger} from "./logger";
import winston from "winston";
import "express-async-errors";
import {parse} from "express-form-data";
import {errorHandler} from "../middlewares/error.handler";
import * as os from "os";

export class Server {

    private app: Application;
    private readonly port: string | number;
    private static instance: Server;
    private routes: Routes;
    private logger: winston.Logger;

    private constructor() {
        this.app = express();
        this.port = <string>process.env["PORT"] || 3000;
        this.routes = Routes.getInstance();
        this.logger = Logger.getLogger();
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        return Server.instance;
    }

    public run(): void {

        this.config();
        this.app.listen(this.port, () => {
            this.logger.info(`App is listening on port ${this.port} !`)
        })
    }

    private config(): void {
        this.databaseSetUp();
        this.app.use(express.json());
        this.app.use(parse({
            uploadDir: os.tmpdir(),
            autoClean: true,
        }));
        this.routesSetUp();
        this.app.use(errorHandler);
    }

    private databaseSetUp(): void {
        const database = new Database();
        database.connect().then(data => console.log(data));
    }

    private routesSetUp(): void {
        this.app.use(this.routes.getRouter());
        this.routes.registerRoutes();
    }
}
