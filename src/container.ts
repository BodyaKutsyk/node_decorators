import { INJECTABLE, InjectableMetadata, Scope } from "./decorators/injectable";
import { INJECT_METADATA_KEY, Token } from "./decorators/inject";
import {PARAM_METADATA_KEY, PropertyMetadataValue, PropertyMetadataValues} from "src/decorators/params";
import {ValidationPipe} from "src/pipes/validation.pipe";

export type Ctx<T = unknown> =  new (...args: any[]) => T

interface ProcessParamProps {
    instance: Ctx;
    args: unknown[];
    methodName: string;
}

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
        const injectMetadata: Map<number, Token> = Reflect.getMetadata(INJECT_METADATA_KEY, target) || new Map();

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

        await this.processParam({instance, args, methodName})

        return instance[methodName](...args)
    }

    private async processParam({ instance, methodName, args }: ProcessParamProps) {
        const propertyMetadataValues: PropertyMetadataValues = Reflect.getOwnMetadata(PARAM_METADATA_KEY, Object.getPrototypeOf(instance), methodName);

        for (const [key, propertyMetadataValue] of propertyMetadataValues) {
            const { data, pipe, type } = propertyMetadataValue;
            let result: any = this.injectsMap.get(type)  || {};
            if (data) {
                if (!result[data]) {
                    throw new Error(`No binding for the: ${data}`)
                }

                result = result[data];
            }

            if (pipe) {
                result = await this.validateParam(instance, methodName, propertyMetadataValue) as Record<string, unknown>;
            }


            args[key] = result;
        }
    }

    private async validateParam(instance: Ctx, methodName: string, propertyMetadataValue: PropertyMetadataValue) {
        const { pipe, index, type } = propertyMetadataValue;
        const paramTypes = Reflect.getOwnMetadata('design:paramtypes', Object.getPrototypeOf(instance), methodName);
        const param = this.injectsMap.get(type);
        const paramType = paramTypes[index];
        if (pipe instanceof ValidationPipe) {
            const { errors, success, data } = await pipe.validate(param, paramType)

            if (success) {
                return data;
            }

            if (errors?.length) {
                throw errors;
            }
        }
    }
}

