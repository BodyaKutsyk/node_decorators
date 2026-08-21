import {Injectable} from "src/decorators/injectable";
import {Inject} from "src/decorators/inject";
import {Database} from "src/db/db.service";
import {TYPES, User} from "src/users/types";
import {CreateUserDto} from "src/dto/create-user.dto";

@Injectable()
export class UsersService {
    // TODO: replace this shame with direct class injection based on design:paramtype
    constructor(@Inject(TYPES.database) private readonly database: Database<User>) {
    }
    getUsers() {
        return this.database.getAll();
    }
    getUser(id: string) {
        return this.database.get(id);
    }
    createUser(user: CreateUserDto) {
        this.database.add(user);
    }
}