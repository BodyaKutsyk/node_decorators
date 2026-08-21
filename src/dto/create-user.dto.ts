import {IsEmail, IsNotEmpty, IsNumber, IsString, Min} from "class-validator";
import {Type} from "class-transformer";

export class CreateUserDto {
    @IsEmail()
    email!: string;
    @Type(() => Number)
    @Min(18)
    @IsNumber()
    age!: number;
    @IsNotEmpty()
    @IsString()
    name!: string;
}
