import { type ZodFirstPartySchemaTypes, ZodFirstPartyTypeKind } from 'zod'

export interface ParseSchemaResult {
    schema: ZodFirstPartySchemaTypes
    defaultValue?: any
    description?: string
    optional?: boolean
}

export function parseSchema(schema: ZodFirstPartySchemaTypes): ParseSchemaResult {
    const result: ParseSchemaResult = { schema }

    if (schema._def.description) {
        result.description = schema._def.description
    }

    function parse(schema: ZodFirstPartySchemaTypes) {
        return Object.assign(result, parseSchema(schema))
    }

    switch (schema._def.typeName) {
        case ZodFirstPartyTypeKind.ZodLazy:
            return parse(schema._def.getter())
        case ZodFirstPartyTypeKind.ZodEffects:
            return parse(schema._def.schema)
        case ZodFirstPartyTypeKind.ZodOptional:
        case ZodFirstPartyTypeKind.ZodNullable:
            return { ...parse(schema._def.innerType), optional: true }
        case ZodFirstPartyTypeKind.ZodDefault:
            return { ...parse(schema._def.innerType), defaultValue: schema._def.defaultValue() }
        case ZodFirstPartyTypeKind.ZodCatch:
            return parse(schema._def.innerType)
        case ZodFirstPartyTypeKind.ZodPromise:
        case ZodFirstPartyTypeKind.ZodBranded:
            return parse(schema._def.type)
        case ZodFirstPartyTypeKind.ZodPipeline:
            return parse(schema._def.in)
    }

    return result
}
