import {Router} from "express";
import {Method, IRoute} from "../decorators/route.types";
import {Container} from "typedi";
import * as fs from 'fs';
import { config } from '../config/config';
import * as path from 'path';
import controllersDirectory = config.controllersDirectory;


export class Routes {

    private readonly router: Router;
    private static instance: Routes;

    private constructor() {
        this.router = Router();
    }

    public static getInstance(): Routes {
        if (!Routes.instance) {
            Routes.instance = new Routes();
        }
        return Routes.instance;
    }

    public setRoute(method: Method, path: string, middlewares: any[], binding: any) {
        this.router[method](path, ...middlewares, binding);
    }

    public getRouter(): Router {
        return this.router;
    }

    public registerRoutes(): void {
        fs.readdirSync(config.controllersDirectory)
            .filter((file) => /\.(controller\.js|controller\.ts)$/.test(file))
            .forEach((file) => {
                const controllerClass = require(path.join(controllersDirectory, file)).default;

                const instance: any = Container.get(controllerClass);
                const routes: IRoute[] = Reflect.getMetadata('routes', controllerClass);
                const prefix: string = Reflect.getMetadata('prefix', controllerClass);
                routes.forEach((route: IRoute) => {
                    this.setRoute(
                        route.method,
                        `${prefix}${route.path}`,
                        route.middlewares,
                        instance[route.methodName].bind(instance),
                    );
                });
            });
    }

}
