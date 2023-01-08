import {UploadedFile} from "../constants/types";
import {IDto} from "./interface.dto";

export interface VideoDto extends IDto {
    title: string,
    file?: UploadedFile
}