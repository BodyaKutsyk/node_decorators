import { INJECTABLE, InjectableMetadata, Scope } from "./injectable";
import {Token} from "./inject";

type Ctx<T = unknown> =  new (...args: any[]) => T

function isToken(parameter: Ctx | Token) {
    return typeof parameter === 'string' || typeof parameter === 'symbol';
}

export class Container {
    private injectsMap = new Map<Token, Ctx>()
    private instances = new Map<Ctx, unknown>()

    bind(token: Token, target: Ctx) {
        this.injectsMap.set(token, target);
    }

    resolve<T>(target: Ctx<T>, to: string[] = []): T {
        if (to.includes(target.name)) {
            throw new Error('Circular dependency')
        }

        const metadata = Reflect.getMetadata(INJECTABLE, target) as InjectableMetadata | undefined;

        if (!metadata) {
            throw new Error(`${target.name} is not Injectable()`)
        }

        if (metadata.scope === Scope.singleton && this.instances.has(target)) {
            return this.instances.get(target) as T;
        }

        const parameters: (Ctx | Token)[]  = (Reflect.getMetadata('design:paramtypes', target)) || [];
        const processedParameters: Ctx[] = parameters.map(parameter => {
            if (isToken(parameter) && this.injectsMap.has(parameter)) {
                return this.injectsMap.get(parameter) as Ctx;
            }

            return parameter as Ctx;
        })

        const args = processedParameters.map(parameter => this.resolve(parameter, [...to, target.name]))
        const instance = new target(...args);
        this.instances.set(target, instance);

        return instance;
    }
}
