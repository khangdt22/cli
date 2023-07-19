import { isDeepStrictEqual } from 'node:util'
import { z, ZodArray, type ZodFirstPartySchemaTypes, ZodFirstPartyTypeKind, ZodLiteral, ZodPromise, ZodSet, ZodTuple, ZodUnion } from 'zod'
import type { NonEmptyArray } from '@khangdt22/utils/array'
import { parseSchema } from './schema'
import { safeParseBigInt, safeParseNumber } from './number'

export type ArgParser = (value: string, previous?: any | undefined) => any

export function concatValue(value: string, previous?: any | any[], defaultValue?: any[]) {
    if (previous === defaultValue || !Array.isArray(previous)) {
        return [value]
    }

    return [...previous, value]
}

export function arrayParser(schema: ZodArray<ZodFirstPartySchemaTypes>, defaultValue?: any[]): ArgParser {
    const parser = getParser(schema._def.type, defaultValue)

    return (value: string, previous?: any[]) => {
        return concatValue(parser(value), previous, defaultValue)
    }
}

export function unionParser(schema: ZodUnion<NonEmptyArray<ZodFirstPartySchemaTypes>>, defaultValue?: any): ArgParser {
    const options = schema._def.options

    return (value: string, previous: any) => {
        for (const option of options) {
            const parsed = option.safeParse(getParser(option, defaultValue)(value, previous))

            if (parsed.success) {
                return parsed.data
            }
        }

        return value
    }
}

export function tupleParser(schema: ZodTuple, defaultValue?: any[]): ArgParser {
    const items = schema._def.items
    const rest = schema._def.rest

    return (value: string, previous?: any[]) => {
        const index = previous?.length ?? 0
        const item = index <= items.length ? items[index] : rest

        if (!item) {
            return value
        }

        return concatValue(getParser(item, defaultValue)(value), previous, defaultValue)
    }
}

export function setParser(schema: ZodSet, defaultValue?: Set<any>): ArgParser {
    const parser = getParser(schema._def.valueType, defaultValue)

    return (value: string, previous?: Set<any>) => {
        const parsed = parser(value)
        const joinPrevious = previous instanceof Set && !isDeepStrictEqual(previous, defaultValue)

        return joinPrevious ? new Set([...previous, parsed]) : new Set([parsed])
    }
}

export function literalParser(schema: ZodLiteral<any>) {
    if (schema._def.value instanceof Date) {
        return getParser(z.date())
    }

    switch (typeof schema._def.value) {
        case 'number':
            return getParser(z.number())
        case 'bigint':
            return getParser(z.bigint())
        default:
            return getParser(z.unknown())
    }
}

export function promiseParser(schema: ZodPromise<ZodFirstPartySchemaTypes>): ArgParser {
    const parser = getParser(schema._def.type)

    return (value: string) => {
        return Promise.resolve(parser(value))
    }
}

export function getParser(schema: ZodFirstPartySchemaTypes, defaultValue?: any): ArgParser {
    schema = parseSchema(schema).schema

    switch (schema._def.typeName) {
        case ZodFirstPartyTypeKind.ZodNumber:
            return (value) => safeParseNumber(value)
        case ZodFirstPartyTypeKind.ZodBigInt:
            return (value) => safeParseBigInt(value)
        case ZodFirstPartyTypeKind.ZodDate:
            return (value) => new Date(value)
        case ZodFirstPartyTypeKind.ZodArray:
            return arrayParser(schema as ZodArray<any>, defaultValue)
        case ZodFirstPartyTypeKind.ZodUnion:
            return unionParser(schema as ZodUnion<any>, defaultValue)
        case ZodFirstPartyTypeKind.ZodTuple:
            return tupleParser(schema as ZodTuple<any>, defaultValue)
        case ZodFirstPartyTypeKind.ZodSet:
            return setParser(schema as ZodSet<any>, defaultValue)
        case ZodFirstPartyTypeKind.ZodLiteral:
            return literalParser(schema as ZodLiteral<any>)
        case ZodFirstPartyTypeKind.ZodPromise:
            return promiseParser(schema as ZodPromise<any>)
    }

    return (value) => value
}
