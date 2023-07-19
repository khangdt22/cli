export function safeParseBigInt(value: string) {
    try {
        return BigInt(value)
    } catch {
        return value
    }
}

export function safeParseNumber(value: string) {
    const result = Number.parseFloat(value)

    if (Number.isNaN(result)) {
        return value
    }

    return result
}
