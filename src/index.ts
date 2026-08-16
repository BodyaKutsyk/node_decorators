import 'reflect-metadata';
import { Inject } from "./utils/inject";
import {Injectable, Scope} from "./utils/injectable";
import {Container} from "./utils/container";

const TYPES = {
    logger: Symbol.for('logger'),
    db: Symbol.for('database')
}

@Injectable()
class Config {}

@Injectable()
class DefaultLogger {
    log(msg: string) {
        console.log(`[${this.constructor.name}]: ${msg}`)
    }
}

@Injectable()
class SupperLogger extends DefaultLogger {}

interface Logger {
    log(msg: string): void
}

@Injectable({ scope: Scope.transient })
class UserService {
    _name = 'userService'
    constructor(@Inject(TYPES.logger) private readonly logger: Logger, config: Config) {
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    getUser(id: string) {
        this.logger.log(id);
        return 'user'
    }
}

const container = new Container();
container.bind(TYPES.logger, SupperLogger)
const service = container.resolve(UserService)
service.getUser('123')




