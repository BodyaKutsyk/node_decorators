import {ClassConstructor} from "class-transformer";

export const METHODS = {
    get: 'GET',
    post: 'POST'
} as const

export type Method = typeof METHODS[keyof typeof  METHODS]

export class Pipe {
    validate<T>(data: unknown, type: ClassConstructor<T>): any {}
}