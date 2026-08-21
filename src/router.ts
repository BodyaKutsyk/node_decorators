import {CONTROLLER_METADATA_KEY} from "src/decorators/controller";
import {METHOD_METADATA_KEY, METHOD_PATH_METADATA_KEY} from "src/decorators/methods";
import {Method, METHODS} from "src/types";
import {Container, Ctx} from "src/container";
import {TYPES} from "src/users/types";
import {UsersService} from "src/users/service";
import {UsersController} from "src/users/controller";
import {BODY_METADATA_KEY, PARAMS_METADATA_KEY} from "src/decorators/params";


function createRouteRegexp(pattern: string) {
    const paramNames: string[] = [];

    const regexpString = pattern.replace(
        /:([^/]+)/g,
        (_, paramName: string) => {
            paramNames.push(paramName);
            return "([^/]+)";
        },
    );

    return {
        regexp: new RegExp(`^${regexpString}$`),
        paramNames,
    };
}

const modules: any[] = [UsersController];

interface RouterProps {
    path: string;
    method: Method;
    param?: string;
    queries?: string
}

interface Route {
    regexp: RegExp;
    paramNames: string[];
    handler: Function;
    controller: Ctx;
}

export class Router {
    private path: string
    private method: Method;

    private routes: Record<Method, Route[]> = {
        [METHODS.get]: [],
        [METHODS.post]: []
    }


    constructor({path, method}: RouterProps) {
        this.method = method;
        this.path = path
        this.initialize()
    }

    private initialize() {
        modules.map(module => {
            const prefix = Reflect.getOwnMetadata(CONTROLLER_METADATA_KEY, module);
            const controllerMethods = Object.getOwnPropertyNames(module.prototype).slice(1)
            controllerMethods.map(controllerMethod => {
                const handler = module.prototype[controllerMethod];
                const method: Method = Reflect.getOwnMetadata(METHOD_METADATA_KEY, handler);
                const path = Reflect.getOwnMetadata(METHOD_PATH_METADATA_KEY, handler) || '';
                const pattern = `/${prefix}/${path}`;
                const { regexp, paramNames } = createRouteRegexp(pattern);
                const route: Route = {
                    handler,
                    regexp,
                    paramNames,
                    controller: module,
                }


                this.routes[method].push(route)
            })
        })
    }

    findRoute() {
        const routes = this.routes[this.method];
        for (const route of routes) {
            const paramsMatch = route.regexp.exec(this.path);
            if (paramsMatch) {
                return { paramsMatch , route };
            }
        }
    }

    async prepareHandler({ body, paramsMatch, route }: { body: string, paramsMatch: RegExpExecArray, route: Route }) {
        const container = new Container();
        container.bind(TYPES.userService, UsersService)
        container.bind(BODY_METADATA_KEY, body)
        const params: Record<string, string> = {};
        route.paramNames.map((param, i) => {
            params[param] = paramsMatch[i + 1]
        })

        if (route.paramNames.length) {
            container.bind(PARAMS_METADATA_KEY, params);
        }

        const controller = container.resolve(UsersController)
        await container.invoke(controller, route.handler.name)
    }
}
