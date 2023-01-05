import {Application} from "express";
import { RequestHandler } from "express-serve-static-core";
import { ParsedQs } from "qs";

export class Router {

    private static app: Application;
    private static instance: Router;

    private constructor() {
    }

    public static setRoute(event: string, callback: RequestHandler<{}, any, any, ParsedQs, Record<string, any>>): boolean {

        this.app.use('/', callback);
        return true;
    }


    public static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    public static setApplication(app: Application): void {
        this.app = app;
    }
}