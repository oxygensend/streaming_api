export type Method = 'get' | 'post' | 'delete' | 'patch' | 'put';

export interface IRoute {
    path: string,
    method: Method,
    methodName: string|symbol,
    middlewares: any[]
}

