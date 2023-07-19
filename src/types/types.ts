/* eslint-disable max-len */

import type { ZodAny, ZodArray, ZodBigInt, ZodBoolean, ZodBranded, ZodCatch, ZodDate, ZodDefault, ZodEnum, ZodLazy, ZodNativeEnum, ZodNumber, ZodObject, ZodOptional, ZodPipeline, ZodPromise, ZodSet, ZodString, ZodTuple, ZodTypeAny, ZodUnion, ZodUnknown } from 'zod'
import type { NonEmptyArray } from '@khangdt22/utils/array'

export type ZodProxy<T extends ZodTypeAny> = T | ZodUnion<NonEmptyArray<T>> | ZodLazy<T> | ZodOptional<T> | ZodDefault<T> | ZodCatch<T> | ZodPromise<T> | ZodBranded<T, any> | ZodPipeline<T, ZodTypeAny>

export type ValidZodType = ZodProxy<ZodString | ZodNumber | ZodBigInt | ZodBoolean | ZodDate | ZodAny | ZodUnknown | ZodEnum<NonEmptyArray<string>> | ZodNativeEnum<Record<string, string>>>

export type ValidZodArray = ZodProxy<ZodArray<ValidZodType>>

export type ValidZodTuple = ZodProxy<ZodTuple<NonEmptyArray, ValidZodType | null>>

export type ValidZodSet = ZodProxy<ZodSet<ValidZodType>>

export type ValidZodArrayLike = ValidZodArray

export interface ValidZodShape {
    [key: string]: ValidZodType
}

export type ValidZodObject = ZodProxy<ZodObject<ValidZodShape>>
