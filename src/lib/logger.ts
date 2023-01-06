import winston, {transports} from "winston";

export class Logger {

    private static logger: winston.Logger

    private constructor() {
    }

    public static getLogger(): winston.Logger {
        if (!this.logger) {
            const logger: winston.Logger = winston.createLogger({
                transports: [
                    new transports.File({filename: 'var/dev.log'})
                ],
                exceptionHandlers: [
                    new transports.File({filename: 'var/exceptions.log'}),
                    new transports.Console()
                ],
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.prettyPrint(),
                    winston.format.colorize({all: true})
                ),
            });

            if (process.env.NODE_ENV !== 'production') {
                logger.add(new transports.Console());
            }

            this.logger = logger;
        }

        return this.logger;
    }
}