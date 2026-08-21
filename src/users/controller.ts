import 'reflect-metadata'
import { Controller } from "src/decorators/controller";
import {Get, Post} from "src/decorators/methods";
import { Inject } from "src/decorators/inject";
import { TYPES } from "src/users/types";
import {Injectable} from "src/decorators/injectable";
import {UsersService} from "src/users/service";
import {Body, Param} from "src/decorators/params";
import {ValidationPipe} from "src/pipes/validation.pipe";
import {CreateUserDto} from "src/dto/create-user.dto";

@Injectable()
@Controller('users')
export class UsersController {
    constructor(@Inject(TYPES.userService) private readonly usersService: UsersService) {}
    @Get(":id/:commentId")
    getUsers(@Body(new ValidationPipe()) body: CreateUserDto, @Param("id") id: string, @Param('commentId') commentId: string) {
        console.log(body, id, commentId)
        return this.usersService.getUsers();
    }

    @Post()
    createUser() {
        return this.usersService.createUser();
    }
}
