import {NextFunction, Request, Response} from "express";
import {HttpException, HttpExceptions} from "../exceptions/exceptions";
import BadRequestException = HttpExceptions.BadRequest;
import {IError} from "../constants/types";


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof HttpException) {
        const message: string | object = err instanceof BadRequestException ?
            {violations: JSON.parse(err.message)} : err.message;
        return res.status(err.statusCode()).json({error: message});
    } else {
        const error: IError = {error: err.message};
        if (process.env.NODE_ENV !== 'production') {
            error["stack"] = err.stack;
        }
        return res.status(500).json(error);
    }
}