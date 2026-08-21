export const CONTROLLER_METADATA_KEY = Symbol('controller');

export function Controller(name: string) {
    return function (target: Function) {
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, name, target)
    }
}