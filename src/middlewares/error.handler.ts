import {NextFunction, Request, Response} from "express";
import {HttpException} from "../exceptions/exceptions";

interface IError {
    error: string,
    stack?: string
}


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof HttpException) {
        return res.status(err.statusCode()).json({error: err.message});
    } else {
        const error: IError = {error: err.message};
        if (process.env.NODE_ENV !== 'production') {
            error["stack"] = err.stack;
        }
        return res.status(500).json(error);
    }
}