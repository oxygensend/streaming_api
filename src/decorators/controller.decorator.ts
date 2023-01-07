import 'reflect-metadata';

/**
 * Controller decorators
 * @constructor
 */
export const Controller = (prefix: string = '/'): ClassDecorator => {

    return (target: any): void => {
        Reflect.defineMetadata('prefix', prefix, target);

        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target);
        }

    }
}