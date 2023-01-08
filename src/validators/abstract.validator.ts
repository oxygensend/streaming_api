import {IDto} from "../dto/interface.dto";
import {IViolation} from "../constants/types";

export abstract class AbstractValidator {

    public abstract validate(dto: IDto): IViolation
}