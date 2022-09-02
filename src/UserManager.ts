import BaseManager from "./BaseManager"
import Client from "./Client"
import { IUserRaw, User } from "./User"

export default class UserManager extends BaseManager<number, User>
{
    public constructor(client: Client)
    {
        super(client, User)
    }

    public resolveID(user: any): number
    {
        if (user instanceof User) return user.ID
        return null
    }

    public async fetch(
        id: number,
        cache=true,
        force=false): Promise<User>
    {
        if (!force)
        {
            let existing = this.cache.get(id)
            if (existing)
            {
                if (force)
                {
                    await existing._Update()
                }
                return existing
            }
        }

        let response = null
        try
        {
            response = await this.client.WebClient.get(`/users/${encodeURIComponent(id)}.json`)
        }
        catch(error)
        {
            throw error
        }

        if (response.error != null)
            throw response.error
        
        let json: IUserRaw = response.toJSON()
        if (json.id == undefined)
            throw json
        
        let instance = new User(this.client, json)
        this.cache.set(id, instance)
        return this.cache.get(id)
    }
}