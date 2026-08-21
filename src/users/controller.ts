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
    @Get(":id")
    getUser(@Param("id") id: string) {
        const user =  this.usersService.getUser(id);

        if (!user) {
            throw new Error('Not found');
        }
        return user;
    }

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Post()
    createUser(@Body(new ValidationPipe()) body: CreateUserDto) {
        return this.usersService.createUser(body);
    }
}
