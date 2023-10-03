import type { Fn } from '@khangdt22/utils/function'

export class Hook<H extends Record<PropertyKey, Fn>> {
    protected readonly hooks = new Map<keyof H, Array<H[keyof H]>>()

    public on<K extends keyof H>(name: K, callback: H[K]) {
        const hooks = this.hooks.get(name)

        if (hooks) {
            hooks.push(callback)
        } else {
            this.hooks.set(name, [callback])
        }
    }

    public async run<K extends keyof H>(name: K, ...args: Parameters<H[K]>) {
        const hooks = this.getHooks(name)

        for (const hook of hooks) {
            await hook(...args)
        }
    }

    public getHooks<K extends keyof H>(name: K) {
        return this.hooks.get(name) ?? []
    }
}
