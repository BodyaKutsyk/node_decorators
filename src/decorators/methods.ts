import { METHODS } from "src/types";

export const METHOD_METADATA_KEY = Symbol('method');
export const METHOD_PATH_METADATA_KEY = Symbol('path');

export function Get(path?: string) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor){
        Reflect.defineMetadata(METHOD_METADATA_KEY, METHODS.get, descriptor.value)
        if (path?.trim().length) {
            Reflect.defineMetadata(METHOD_PATH_METADATA_KEY, path, descriptor.value);
        }
    }
}

export function Post(path?: 'string') {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor){
        Reflect.defineMetadata(METHOD_METADATA_KEY, METHODS.post, descriptor.value)
        if (path?.trim().length) {
            Reflect.defineMetadata(METHOD_PATH_METADATA_KEY, path, descriptor.value);
        }
    }
}