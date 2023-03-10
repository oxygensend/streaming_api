import {ReadStream} from "fs";

export interface MultipartRequest extends Request {
    files?: any
    body: any
}

export interface UploadedFile {
    fieldName: 'test',
    originalFilename: string,
    headers: object,
    path: string,
    size: number,
    name: string,
    type: string,
}

export interface IPageOptions {
    page: number,
    limit: number
}

export interface IError {
    error: string,
    stack?: string
}

export interface IViolation {
    error: boolean
    violations: any
}

export interface IVideoViolation {
    title?: string,
    file?: string
}


export interface IVideoStream {
    videoStream: ReadStream;
    header: { "Accept-Ranges": string; "Content-Range": string; "Content-Length": number; "Content-Type": string }
}