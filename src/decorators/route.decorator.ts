import {Method, IRoute} from "./route.types";
import 'reflect-metadata';

/**
 *  Method decorators factory responsible for routing in application
 */
const methodRouteDecoratorFactory = (method: Method) => {
    return (path: string = '/', middlewares: any[] = []): MethodDecorator => {
        return (target: Object, propertyKey: symbol | string): void => {
            // Create routes metadata in the object if doesn't exists
            if (!Reflect.hasMetadata('routes', target.constructor)) {
                Reflect.defineMetadata('routes', [], target.constructor);
            }
            // Create new route and add it to object's metadata
            const routes: IRoute[] = Reflect.getMetadata('routes', target.constructor);
            routes.push({
                path: path,
                method: method,
                methodName: propertyKey,
                middlewares: middlewares
            });
            Reflect.defineMetadata('routes', routes, target.constructor);
        };
    }
}

export const Get = methodRouteDecoratorFactory('get');
export const Post = methodRouteDecoratorFactory('post');
export const Delete = methodRouteDecoratorFactory('delete');
export const Patch = methodRouteDecoratorFactory('patch');
export const Put = methodRouteDecoratorFactory('put');