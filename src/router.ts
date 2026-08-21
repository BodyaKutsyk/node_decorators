import {CONTROLLER_METADATA_KEY} from "src/decorators/controller";
import {METHOD_METADATA_KEY, METHOD_PATH_METADATA_KEY} from "src/decorators/methods";
import {Method, METHODS} from "src/types";
import {Ctx} from "src/container";
import {UsersController} from "src/users/controller";
import {PROPERTY_METADATA_TYPE} from "src/decorators/params";
import {createRouteRegexp} from "src/utils/create-route-regexp";
import {modules} from "src/modules";

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
        for (const controller of modules.keys()) {
            const prefix = Reflect.getOwnMetadata(CONTROLLER_METADATA_KEY, controller);
            const controllerMethods = Object.getOwnPropertyNames(controller.prototype).slice(1)
            controllerMethods.map(controllerMethod => {
                const handler = controller.prototype[controllerMethod];
                const method: Method = Reflect.getOwnMetadata(METHOD_METADATA_KEY, handler);
                const path = Reflect.getOwnMetadata(METHOD_PATH_METADATA_KEY, handler) || '';
                const pattern = `/${prefix}${path ? `/${path}` : ''}`;
                const { regexp, paramNames } = createRouteRegexp(pattern);
                const route: Route = {
                    handler,
                    regexp,
                    paramNames,
                    controller,
                }


                this.routes[method].push(route)
            })
        }
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
        const container = modules.get(route.controller);
        if (container) {
            const params: Record<string, string> = {};

            route.paramNames.map((param, i) => {
                params[param] = paramsMatch[i + 1]
            })
            container.bind(PROPERTY_METADATA_TYPE.body, body);
            container.bind(PROPERTY_METADATA_TYPE.param, params);
            container.bind(PROPERTY_METADATA_TYPE.query, this.queries);

            const controller = container.resolve(UsersController)
            return await container.invoke(controller, route.handler.name);
        }
    }
}
