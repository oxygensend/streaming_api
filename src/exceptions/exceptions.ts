import {HTTP_CODES} from "../constants/http.codes";

export abstract class HttpException extends Error {
    public constructor(message?: string) {
        super(message);
    }

    public abstract statusCode(): HTTP_CODES
}

export namespace HttpExceptions {
    export class NotFoundException extends HttpException {
        public statusCode(): HTTP_CODES {
            return HTTP_CODES.NOT_FOUND;
        }
    }

    export class InternalException extends HttpException {
        public statusCode(): HTTP_CODES {
            return HTTP_CODES.INTERNAL_SERVER_ERROR;
        }
    }

    export class AccessDeniedException extends HttpException {
        public statusCode(): HTTP_CODES {
            return HTTP_CODES.FORBIDDEN;
        }
    }

    export class UnauthorizedException extends HttpException {
        public statusCode(): HTTP_CODES {
            return HTTP_CODES.UNAUTHORIZED;
        }
    }

    export class BadRequestException extends HttpException {
        public statusCode(): HTTP_CODES {
            return HTTP_CODES.BAD_REQUEST;
        }
    }
}