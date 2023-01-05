import express, {Application} from "express";
import {logger} from "../logger/logger";
import {Database} from "./database";
import {Router} from "./router";

export class Server {

    private static app: Application;
    private static port: string | number;
    private static instance: Server;

    private constructor() {
        Server.app = express();
        Server.port = <string>process.env["PORT"] || 3000;
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        return Server.instance;
    }

    public run(): void {

        this.config();

        Server.app.listen(Server.port, () => {
            logger.info(`App is listening on port ${Server.port} !`)
        })
    }

    private config(): void {

        this.databaseSetUp();
        this.routerSetUp();
        Server.app.use(express.json());

    }

    private databaseSetUp(): void {
        const database = new Database();
        database.connect().then(data => console.log(data));
    }

    private routerSetUp(): void {
        Router.getInstance();
        Router.setApplication(Server.app);
        Router.setRoute('/', (req, res) => {
            res.send('WELCOME');
        });
    }
}
