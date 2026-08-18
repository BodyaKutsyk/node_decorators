import 'reflect-metadata';
import { Inject } from "src/decorators/inject";
import { Injectable, Scope } from "src/decorators/injectable";
import { Container } from "src/container";
import { TYPES } from "src/tokens";

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
    constructor(@Inject(TYPES.logger) private readonly logger: Logger, private readonly config: Config) {}

    getUser(id: string) {
        this.logger.log(id);
    }
}

const container = new Container();
container.bind(TYPES.logger, SupperLogger)
const service = container.resolve(UserService)
service.getUser('123')




