import {NextFunction, Request, Response} from "express";
import {Types} from "mongoose";
import {HTTP_CODES} from "../constants/http.codes";

export const objectIDValidator = (req: Request, res: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.id))
        return res.status(HTTP_CODES.NOT_FOUND).send(`Invalid ID ${req.params.id}`);
    return next();
}