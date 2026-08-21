import {Container} from "src/container";
import {UsersService} from "src/users/service";
import {TYPES} from "src/users/types";
import {Database} from "src/db/db.service";

const usersContainer = new Container();
usersContainer.bind(TYPES.userService, UsersService)
usersContainer.bind(TYPES.database, Database)

export { usersContainer }