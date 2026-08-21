import {CONTROLLER_METADATA_KEY} from "src/decorators/controller";
import {METHOD_METADATA_KEY, METHOD_PATH_METADATA_KEY} from "src/decorators/methods";
import {Method, METHODS} from "src/types";
import {Container, Ctx} from "src/container";
import {TYPES} from "src/users/types";
import {UsersService} from "src/users/service";
import {UsersController} from "src/users/controller";
import { PROPERTY_METADATA_TYPE } from "src/decorators/params";


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
    queries: URLSearchParams
}

interface Route {
    regexp: RegExp;
    paramNames: string[];
    handler: Function;
    controller: Ctx;
}

export class Router {
    private path: string;
    private method: Method;
    private queries: Record<string, unknown>;

    private routes: Record<Method, Route[]> = {
        [METHODS.get]: [],
        [METHODS.post]: []
    }


    constructor({path, method, queries}: RouterProps) {
        this.method = method;
        this.path = path;
        this.queries = this.parseQueries(queries);
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

    private parseQueries(queries: URLSearchParams) {
        const obj: Record<string, unknown> = {};
        queries.forEach((value, key) => {
            if (obj[key]) {
                obj[key] = Array.isArray(obj[key]) ? [...obj[key], value] : [obj[key], value];
            } else {
                obj[key] = value;
            }
        });

        return obj;
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
        container.bind(PROPERTY_METADATA_TYPE.body, body)
        const params: Record<string, string> = {};
        route.paramNames.map((param, i) => {
            params[param] = paramsMatch[i + 1]
        })

        container.bind(PROPERTY_METADATA_TYPE.param, params);
        container.bind(PROPERTY_METADATA_TYPE.query, this.queries);

        const controller = container.resolve(UsersController)
        await container.invoke(controller, route.handler.name)
    }
}
