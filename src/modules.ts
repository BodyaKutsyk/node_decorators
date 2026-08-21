import {Container, Ctx} from "src/container";
import {usersContainer} from "src/users/module";
import {UsersController} from "src/users/controller";

export type Modules = Map<Ctx, Container>

const modules: Modules = new Map();
modules.set(UsersController, usersContainer);

export { modules };