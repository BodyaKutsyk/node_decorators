import { Injectable } from "src/decorators/injectable";
import { Inject} from "src/decorators/inject";
import { TYPES } from "src/tokens";

@Injectable()
export class InjectableClass {}

@Injectable({ scope: 'transient' })
export class InjectableTransientClass {}

export class TestClass {}

@Injectable()
export class Logger {
    log(message: string) {
        console.log(message);
        return message;
    }
}

@Injectable()
export class Database {
    constructor(
        @Inject(TYPES.logger)
        public logger: Logger
    ) {}
}

@Injectable()
export class UserRepository {
    constructor(
        @Inject(TYPES.database)
        public database: Database
    ) {}
}

@Injectable()
export class UserService {
    constructor(
        @Inject(TYPES.userRepository)
        public repository: UserRepository
    ) {}
}