import {AbstractValidator} from "./abstract.validator";
import {IViolation, IVideoViolation, UploadedFile} from "../constants/types";
import {Service} from "typedi";
import validator from "validator";
import {VideoDto} from "../dto/video.dto";
import * as mime from 'mime-types'

@Service()
export class VideoValidator extends AbstractValidator {

    private validMimeTypes: string[] = [
        'video/mp4', 'video/x-flv', 'video/x-ms-wmv', 'video/x-msvideo', 'video/quicktime'
    ]

    public validate(dto: VideoDto): IViolation {

        const violations: IVideoViolation = {};

        const titleViolations = this.validateTitleField(dto.title);
        if (titleViolations) {
            violations['title'] = titleViolations;
        }

        const fileViolations = this.validateFileField(dto.file);
        if (fileViolations) {
            violations['file'] = fileViolations;
        }

        return {
            error: Object.keys(violations).length > 0,
            violations: violations
        }

    }

    public validateTitleField(title?: string): string | undefined {

        let violation: string | undefined = undefined;

        if (!title) {
            violation = "Field `title` is required";
        } else if (!validator.isLength(title, {min: 3, max: 50})) {
            violation = "Length of fields `title` must ranges between 3 and 50 characters";
        }
        return violation;

    }

    public validateFileField(file?: UploadedFile): string | undefined {

        let violation: string | undefined = undefined;
        if (!file) {
            violation = 'Field `file` is required';
        } else {
            const mimeType: string | false = mime.lookup(file.path);
            if ((!mimeType) || (!this.validMimeTypes.includes(mimeType))) {
                violation = `Valid file format. Allowed formats are: [ ${this.validMimeTypes.join(',')} ]`
            }
        }

        return violation;
    }
}