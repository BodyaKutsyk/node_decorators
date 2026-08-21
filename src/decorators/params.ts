export const BODY_METADATA_KEY = Symbol('body');
export const PARAMS_METADATA_KEY = Symbol('param');
export const QUERY_METADATA_KEY = Symbol('query');

interface BodyMetadataValue {
    pipe?: Function
}

export function Body<T>(pipe?: T) {
    return function (target: any, propertyKey: string, paramIndex: number) {
        Reflect.defineMetadata(BODY_METADATA_KEY, { paramIndex, pipe } , target, propertyKey);
    }
}

export function Param(name: string) {
    return function (target: any, propertyKey: string, paramIndex: number) {
        const params = Reflect.getOwnMetadata(PARAMS_METADATA_KEY, target, propertyKey) || new Map();
        params.set(paramIndex, name)

        Reflect.defineMetadata(PARAMS_METADATA_KEY, params, target, propertyKey);
    }
}

export function Query(query: string) {
    return function (target: any, propertyKey: string, paramIndex: number) {
        Reflect.defineMetadata(PARAMS_METADATA_KEY, [paramIndex, query], target, propertyKey);
    }
}