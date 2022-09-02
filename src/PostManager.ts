import BaseManager from "./BaseManager"
import Client, { DefaultISearchParameters, ISearchParameters } from "./Client"
import WebClient from './WebClient'
import Post from "./Post"
import type {VoteState} from './index'
import { IRawPost } from "./RawPost"

export default class PostManager extends BaseManager<number, Post>
{
    public constructor(client: Client)
    {
        super(client, Post)
    }

    public resolveID(post: any): number
    {
        if (post instanceof Post) return post.ID
        return null
    }

    public async fetch(id: number, cache=true, force=false): Promise<Post>
    {
        if (!force)
        {
            let existing = this.cache.get(id)
            if (existing)
            {
                if (!this.client.Gatekeeper.Vaccinated(existing))
                {
                    this.cache.delete(id)
                    return null
                }
                if (force)
                {
                    await existing._Update()
                    return existing;
                }
                else
                {
                    return existing;
                }
            }
        }
        let response = null
        try {
            response = await this.client.WebClient.get(`${this.client.Endpoint}/posts/${encodeURIComponent(id)}.json`)
        } catch (error) {
            throw error
        }
        if (response.error != null)
            throw response.error
        let json = response.toJSON()
        if (json.success.toString() == 'false')
        {
            throw new Error(`Failed to get post: ${json.reason}\n${JSON.stringify(json)}`)
        }

        let instance = new Post(this.client, id, json.post, null)
        if (!this.client.Gatekeeper.Vaccinated(instance))
        {
            this.cache.delete(id)
            return null;
        }
        
        this.cache.set(id, instance)
        return this.cache.get(id)
    }

    public async favorite(postID: number, state=true): Promise<Post>
    {
        let post = await this.fetch(postID)
        if (post == null)
        {
            throw new Error(`Post ${postID} does not exist`)
        }
        post.Favorite(state)
        return post
    }
    public async vote(postID: number, direction: VoteState): Promise<Nullable<Post>>
    {
        let post = await this.fetch(postID)
        if (post == null)
            throw new Error(`Post ${postID} does not exist`)
        await post.Vote(direction)
        this.client.emit('post:vote', {
            id: postID,
            state: direction
        })
        return post
    }

    public async search(options: ISearchParameters=DefaultISearchParameters, cache=true, force=false): Promise<Post[]>
    {
        options = {
            ...DefaultISearchParameters,
            ...options
        }
        let requestParameters = {
            tags: options.query,
            page: options.page,
            limit: options.limit
        }
        let stringRequestParameters = WebClient.ObjectToParameters(requestParameters)
        stringRequestParameters += options.extraParameters

        let response = null
        try
        {
            response = await this.client.WebClient.get(`/posts.json?${stringRequestParameters}`)
        }
        catch (error)
        {
            throw error
        }
        if (response.error != undefined && response.error != null)
            throw response.error
        
        let json = response.toJSON()
        if (json.success != undefined && json.success == false)
        {
            throw json
        }

        if (json.posts == undefined)
            throw json
        if (!(json.posts instanceof Array))
            throw new Error(`json.posts is not an instanceof Array. It is ${json.posts.constructor.name}`)
        
        let items = []

        for (let rawPost of json.posts)
        {
            let postExists = this.cache.get(rawPost.id)
            if (postExists == null)
            {
                let instance = new Post(this.client, rawPost.id, rawPost, null)
                if (!this.client.Gatekeeper.Vaccinated(instance))
                    continue
                this.cache.set(instance.ID, instance)
                items.push(this.cache.get(rawPost.id))
            }
            else
            {
                postExists.data = rawPost
                items.push(this.cache.get(rawPost.id))
            }
        }

        this.client.emit('post:search', options.query)
        
        return this.client.Gatekeeper.SanitizePosts(items)
    }
}