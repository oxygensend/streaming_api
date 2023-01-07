import {Server} from "./lib/server";
import {Logger} from "./lib/logger";

const server = Server.getInstance();
server.run();


/** Handle uncaught errors */
const logger = Logger.getLogger();
process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled rejection: ${reason.message || reason}`);
    throw new Error(reason.message || reason);
})

process.on('uncaughtException', (reason: Error) => {
    logger.error(`Uncaught exception: ${reason.message}`);
    throw new Error(reason.message);
})
