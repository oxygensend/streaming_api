import winston, {transports} from "winston";

export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'var/dev.log'})
    ],
    exceptionHandlers: [
        new transports.File({filename: 'exceptions.log'})
    ]
})
