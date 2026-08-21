import {Pipe} from "src/types";

export const PARAM_METADATA_KEY = Symbol.for('param');

export const PROPERTY_METADATA_TYPE =  {
    body: Symbol('body'),
    param: Symbol('param'),
    query: Symbol('query')
} as const;



export interface PropertyMetadataValue {
    type: symbol,
    index: number;
    data?: string;
    // TODO: support multiple pipes
    pipe?: Pipe
}

export type PropertyMetadataValues = Map<number, PropertyMetadataValue>

function generatePropertyMetadata(type: symbol, index: number, dataOrPipe?: string | Pipe, pipe?: Pipe): PropertyMetadataValue {
    const propertyMetadata: PropertyMetadataValue = {
        type,
        index
    };

    if (dataOrPipe) {
        if (dataOrPipe instanceof Pipe) {
            propertyMetadata.pipe = dataOrPipe;
        } else {
            propertyMetadata.data = dataOrPipe

            if (pipe) {
                propertyMetadata.pipe = pipe;
            }
        }
    }

    return propertyMetadata;
}

function expandPropertiesMetadata(target: any, propertyKey: string, index: number, metadataValue: PropertyMetadataValue): PropertyMetadataValues {
    const existingPropertyMetadataValue: PropertyMetadataValues = Reflect.getOwnMetadata(PARAM_METADATA_KEY, target, propertyKey) || new Map();
    existingPropertyMetadataValue.set(index, metadataValue)
    return existingPropertyMetadataValue;
}

interface DefinitionMetadataProps {
    propertyMetadataType: symbol;
    target: any;
    propertyKey: string;
    paramIndex: number;
    dataOrPipe?: string | Pipe;
    pipe?: | Pipe;
}

function setParamMetadata({ propertyMetadataType, paramIndex, target, propertyKey, dataOrPipe, pipe }: DefinitionMetadataProps) {
    const propertyMetadataValue = generatePropertyMetadata(propertyMetadataType, paramIndex, dataOrPipe, pipe);
    const existingPropertyMetadataValue = expandPropertiesMetadata(target, propertyKey, paramIndex, propertyMetadataValue);

    Reflect.defineMetadata(PARAM_METADATA_KEY, existingPropertyMetadataValue, target, propertyKey);
}

export function Body(pipe?: Pipe): Function;
export function Body(data?: string): Function;
export function Body(dataOrPipe?: string | Pipe, pipe?: Pipe): Function {
    return function (target: any, propertyKey: string, paramIndex: number) {
        setParamMetadata({ target, propertyKey, paramIndex, dataOrPipe, pipe, propertyMetadataType: PROPERTY_METADATA_TYPE.body })
    }
}

export function Param(pipe?: Pipe): Function;
export function Param(data?: string): Function;
export function Param(dataOrPipe?: string | Pipe, pipe?: Pipe): Function {
    return function (target: any, propertyKey: string, paramIndex: number) {
        setParamMetadata({ target, propertyKey, paramIndex, dataOrPipe, pipe, propertyMetadataType: PROPERTY_METADATA_TYPE.param })
    }
}

export function Query(pipe?: Pipe): Function;
export function Query(data?: string): Function;
export function Query(dataOrPipe?: string | Pipe, pipe?: Pipe ) {
    return function (target: any, propertyKey: string, paramIndex: number) {
        setParamMetadata({ target, propertyKey, paramIndex, dataOrPipe, pipe, propertyMetadataType: PROPERTY_METADATA_TYPE.query })
    }
}