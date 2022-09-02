import { Collection } from "@discordjs/collection"
import Client from "./Client"
export default class BaseManager<K, V>
{
    public constructor(client: Client, holds: any)
    {
        Object.defineProperty(this, 'client', { value: client })
        Object.defineProperty(this, 'holds', { value: holds })
        this.cache = new Collection<K, V>()
    }

    public cache: Collection<K, V>
    public cacheType: typeof Collection
    public valueType: V
    public client: Client

    public add(data: V, cache=true, key: K)
    {
        let exists = this.cache.get(key)
        if (exists && cache)
            this.cache.set(key, data)
        if (exists)
            return exists
        this.cache.set(key, data)
        return this.cache.get(key)
    }
    public valueOf()
    {
        return this.cache
    }
}