import {EventEmitter} from 'events'
import * as Client from './Client'
import Post from './Post'

export interface IRawComment
{
    id?: number
    post_id?: number
    creator_id?: number
    body?: string
    score?: number
    created_at?: string
    updated_at?: string
    updater_id?: number
    do_not_bump_post?: boolean
    is_hidden?: boolean
    is_sticky?: boolean
    warning_type?: any
    warning_user_id?: number
    creator_name?: string
    updater_name?: string
}

export default class Comment
    extends EventEmitter
{
    public data: IRawComment = {}
    public Client: Client.default
    public get Post(): Nullable<Post>
    {
        return this.Client.PostCache[this.data.post_id] || null
    }

    public constructor(client: Client.default, commentID: number, data: IRawComment)
    {
        super()
        this.Client = client
        this.data.id = commentID
        Object.assign(this.data, data)

        this.on('updateasync', () => {
            this._Update()
        })
        this.on('update', async () => {
            await this._Update()
        })
        this.on('done', (status) => {
            console.debug(`[Comment:${this.data.id}] Done: ${status}`)
        })
        this.on('error', (err) => {
            console.error(`[Comment:${this.data.id}] ${err.message}`, err.error)
        })
    }

    async _Update()
    {
        let res = await this.Client.WebClient.get(`/comments/${this.data.id}.json`)
        if (res.data != undefined)
        {
            Object.assign(this.data, res.data)
            this._Format(this.data)
            this.emit('done', 'update')
        }
        else
        {
            this.emit('error', {message: 'Failed to update', error: res.error})
        }
    }
    public _Format(data: IRawComment)
    {
        this.data.id = data.id
    }

    get ID() { return this.data.id }

    get createdAt() { return new Date(this.data.created_at ?? 0) }
    get updatedAt() { return new Date(this.data.updated_at ?? 0) }
    get Content() { return this.data.body ?? "" }
    get Score() { return this.data.score ?? 0 }
    get CreatorID() { return this.data.creator_id ?? -1 }
    get CreatorUsername() { return this.data.creator_name ?? "Unknown" }
    get UpdaterID() { return this.data.updater_id ?? -1 }
    get UpdaterUsername() { return this.data.updater_name ?? "Unknown" }
    get DisablePostBump() { return this.data.do_not_bump_post ?? false }
    get Hidden() { return this.data.is_hidden ?? false }
    get Sticky() { return this.data.is_sticky ?? false }
    get WarningType() { return this.data.warning_type ?? null }
    get WarningUserID() { return this.data.warning_user_id ?? null}

    public async Delete()
    {
        return this.Client.DeleteCommentID(this.data.id)
    }
    public async Reply(content: string)
    {
        return this.Client.CommentReply(this, content)
    }
}