export const INJECTABLE = Symbol('injectable');

export enum Scope {
    singleton = 'singleton',
    transient = 'transient'
}

type ScopeVariants = keyof typeof Scope;

interface InjectableProps {
    scope: ScopeVariants
}

export interface InjectableMetadata {
    scope: ScopeVariants
}

export function Injectable({ scope }: InjectableProps = { scope: Scope.singleton }): ClassDecorator  {
    return (target) => {
        Reflect.defineMetadata(INJECTABLE, { scope }, target)
    }
}