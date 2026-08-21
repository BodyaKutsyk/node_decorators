import { Pipe } from "src/types";
import {ClassConstructor, plainToInstance} from "class-transformer";
import {validate, ValidationError} from "class-validator";

interface ValidateResponse<T> {
    data?: T
    errors?: ValidationError[];
    success: boolean;
}

export class ValidationPipe extends Pipe {
    async validate<T>(body: unknown, type: ClassConstructor<T>): Promise<ValidateResponse<T>> {
        const instance = plainToInstance(type, body);
        const errors = await validate(instance as object);
        if (errors.length) {
            return {
                success: false,
                errors,
            }
        }

        return  {
            success: true,
            data: instance,
        }
    }
}