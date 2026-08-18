import 'reflect-metadata'
export type Token = string | number | symbol

type ParamTokenMetadata = Map<number, Token>
export const PARAM_METADATA_KEY = 'design:paramtoken'

export function Inject(token: Token) {
    return function (target: Function, propertyKey: string | undefined , parameterIndex: number) {
        let paramTokenMetadata: ParamTokenMetadata = Reflect.getOwnMetadata(PARAM_METADATA_KEY, target) ?? new Map();

        paramTokenMetadata.set(parameterIndex, token)
        Reflect.defineMetadata(PARAM_METADATA_KEY, paramTokenMetadata, target);
    }
}