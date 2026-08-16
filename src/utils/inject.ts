export type Token = string | number | symbol

export function Inject(token: Token) {
    return function (target: Function, propertyKey: string | undefined , parameterIndex: number) {
        const types = Reflect.getMetadata('design:paramtypes', target)
        types[parameterIndex] = token;
    }
}