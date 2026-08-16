import { INJECTABLE, InjectableMetadata, Scope } from "./decorators/injectable";
import { PARAM_METADATA_KEY, Token } from "./decorators/inject";

type Ctx<T = unknown> =  new (...args: any[]) => T

export class Container {
    private injectsMap = new Map<Token, Ctx>()
    private instances = new Map<Ctx, unknown>()

    bind(token: Token, target: Ctx) {
        this.injectsMap.set(token, target);
    }

    resolve<T>(target: Ctx<T>, to: Ctx[] = []): T {
        if (to.includes(target)) {
            throw new Error('Circular dependency')
        }

        const metadata = Reflect.getMetadata(INJECTABLE, target) as InjectableMetadata | undefined;

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
                    processedParameter = inject;
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
}
