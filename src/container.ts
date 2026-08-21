import { INJECTABLE, InjectableMetadata, Scope } from "./decorators/injectable";
import { PARAM_METADATA_KEY, Token } from "./decorators/inject";
import {BODY_METADATA_KEY, PARAMS_METADATA_KEY} from "src/decorators/params";
import {Pipe} from "src/types";
import {ValidationPipe} from "src/pipes/validation.pipe";

export type Ctx<T = unknown> =  new (...args: any[]) => T

export class Container {
    private injectsMap = new Map<Token, unknown>()
    private instances = new Map<Ctx, unknown>()

    bind(token: Token, target: unknown) {
        this.injectsMap.set(token, target);
    }

    resolve<T>(target: Ctx<T>, to: Ctx[] = []): T {
        if (to.includes(target)) {
            const depsPath = [...to, target].map(dep => dep.name).join(' -> ');
            throw new Error(`Circular dependency: ${depsPath}`)
        }

        const metadata = Reflect.getOwnMetadata(INJECTABLE, target) as InjectableMetadata | undefined;

        if (!metadata) {
            throw new Error(`${target.name} is not Injectable()`)
        }

        const isSingleton = metadata.scope === Scope.singleton;
        if (isSingleton && this.instances.has(target)) {
            return this.instances.get(target) as T;
        }

        const parameters: Ctx[]  = (Reflect.getMetadata('design:paramtypes', target)) || [];
        const injectMetadata: Map<number, Token> = Reflect.getMetadata(PARAM_METADATA_KEY, target) || new Map();

        const args = parameters.map((parameter, i) => {
            const hasToken = injectMetadata.has(i);
            let processedParameter = parameter;

            if (hasToken) {
                const token = injectMetadata.get(i) as Token;
                const inject = this.injectsMap.get(token);

                if (inject) {
                    processedParameter = inject as Ctx;
                } else {
                    throw new Error(`No binding found for token: ${token.toString()}`)
                }
            }

            return this.resolve(processedParameter, [...to, target])
        })

        const instance = new target(...args);

        if (isSingleton) {
            this.instances.set(target, instance);
        }

        return instance;
    }
    async invoke<T>(instance: any, methodName: string): Promise<T> {
        const args: unknown[] = [];

        this.processParam(instance, args, methodName)
        await this.processBody(instance, args, methodName);

        return instance[methodName](...args)
    }

    private async processBody(instance: Ctx, args: unknown[], methodName: string) {
        const bodyMetadata: { pipe?: Pipe, paramIndex: number } = Reflect.getOwnMetadata(BODY_METADATA_KEY , Object.getPrototypeOf(instance), methodName)
        let body = this.injectsMap.get(BODY_METADATA_KEY);

        if (bodyMetadata) {
            if (!body) {
                throw new Error('No binding for @Body()');
            }

            if (bodyMetadata.pipe) {
                body = await this.validateBody(instance, bodyMetadata.pipe, methodName);
            }

            args[bodyMetadata.paramIndex] = body;
        }
    }
    private processParam(instance: unknown, args: unknown[], methodName: string) {
        const paramsMetadata: Map<number, string> = Reflect.getOwnMetadata(PARAMS_METADATA_KEY, Object.getPrototypeOf(instance), methodName);
        const params = this.injectsMap.get(PARAMS_METADATA_KEY) as Record<string, string>;

        for (const [key, value] of paramsMetadata) {
            if (!params[value]) {
                throw new Error(`No binding for the parameter: ${value}`)
            }

            args[key] = params[value]
        }
    }
    private async validateBody(instance: Ctx, pipe: Pipe, methodName: string) {
        const bodyMetadata: { pipe?: Pipe, paramIndex: number } = Reflect.getOwnMetadata(BODY_METADATA_KEY , Object.getPrototypeOf(instance), methodName)
        const paramTypes = Reflect.getOwnMetadata('design:paramtypes', Object.getPrototypeOf(instance), methodName);
        const body = this.injectsMap.get(BODY_METADATA_KEY);
        const bodyType = paramTypes[bodyMetadata.paramIndex];
        if (pipe instanceof ValidationPipe) {
            const { errors, success, data } = await pipe.validate(body, bodyType)

            if (success) {
                return data;
            }

            if (errors?.length) {
                throw errors;
            }
        }
    }
}

