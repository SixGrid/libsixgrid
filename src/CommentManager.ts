import BaseManager from './BaseManager'
import Client from './Client'
import Comment from "./Comment"
import WebClient, { CustomIncomingMessage } from './WebClient'

export default class CommentManager extends BaseManager<number, Comment>
{
    public constructor(client: Client)
    {
        super(client, Comment)
    }

    public resolveID(comment: any): number
    {
        if (comment instanceof Comment) return comment.ID
        return null
    }

    public async fetch(
        id: number,
        cache=true,
        force=false): Promise<Comment>
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
            response = await this.client.WebClient.get(`${this.client.Endpoint}/comments/${encodeURIComponent(id)}.json`)
        }
        catch (error) {
            throw error
        }
        if (response.error != null)
            throw response.error
        let json = response.toJSON()

        let instance = new Comment(this.client, id, json)
        this.cache.set(id, instance)
        return this.cache.get(id)
    }

    public async edit(
        id: number,
        content: string,
        sticky: boolean=false,
        cache=true,
        force=false): Promise<CustomIncomingMessage>
    {
        let comment = await this.fetch(id, cache, force)
        if (comment == null)
            throw new Error(`Comment ${id} does not exist`)
        let params = WebClient.ObjectToParameters({
            '_method': 'patch',
            'comment[body]': content,
            'commit': 'Submit',
            'comment[is_sticky]': sticky ? 1 : 0
        })
        let res = await this.client.WebClient.post(`/comments/${encodeURIComponent(id)}.json?${params}`, params)
        if (res.error) throw res.error
        this.cache.get(id).data.body = content
        this.cache.get(id).data.is_sticky = sticky
        return res
    }

    public async reply(
        id: number,
        content: string,
        bump: boolean=false,
        sticky: boolean=false,
        cache=true,
        force=false)
    {
        let comment = await this.fetch(id, cache, force)
        if (comment == null)
            throw new Error(`Comment ${id} does not exist`)
        let params = WebClient.ObjectToParameters({
            'comment[post_id]': comment.ID,
            'comment[body]': `[quote]"${comment.CreatorUsername}":/user/show/${comment.CreatorID}+said:\r\n${comment.Content.replace(" ", "+")}\r\n[/quote]\r\n\r\n${content}`,
            'commit': 'Submit',
            'comment[do_not_bump_post]': bump ? 1 : 0,
            'comment[is_sticky]': sticky ? 1 : 0
        })
        let res = await this.client.WebClient.post(`/comments`, params)
        if (res.error) throw res.error
        await this.cache.get(id)._Update()
        return res
    }

    public async delete(id: number)
    {
        let res = await this.client.WebClient.delete(`/comment/${id}.json`)
        if (res.error) throw res.error
        this.cache.delete(id)
        return res
    }
}