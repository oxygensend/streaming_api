import {Router} from "express";
import {Method, IRoute} from "../decorators/route.types";
import {controllers} from "../controllers";
import {Container} from "typedi";


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
        controllers.forEach((controllerClass) => {
            const instance: any = Container.get(controllerClass);
            const routes: IRoute[] = Reflect.getMetadata('routes', controllerClass);
            const prefix: string = Reflect.getMetadata('prefix', controllerClass);
            routes.forEach((route: IRoute) => {
                this.setRoute(
                    route.method,
                    `${prefix}${route.path}`,
                    route.middlewares,
                    instance[route.methodName].bind(instance)
                );
            });
        });
    }

}
