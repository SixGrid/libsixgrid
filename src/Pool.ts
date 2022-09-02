import Client from './Client'
import Post from './Post'

export interface IRawPost
{
    id: number
    name: string
    created_at: string
    updated_at: string
    creator_id: number
    description: string
    is_active: boolean
    category: string
    is_deleted: boolean
    post_ids: number[]
    creator_name: string
    post_count: number
}

export default class Pool
{
    public Client: Client
    public Pool(client: Client, data: IRawPost)
    {
        this.Client = client
        this._data = data

        for (let postID_Index in data.post_ids)
        {
            let postID = data.post_ids[postID_Index]
            this.Client.GetPost(postID).then((post) =>
            {
                this.Posts[postID_Index] = post
            })
        }
    }
    public _data: IRawPost
    public Posts: Post[] = []
    get PostIDs() { return this._data.post_ids }
    get PostCount() { return this._data.post_count }

    get ID() { return this._data.id }
    get Name() { return this._data.name }
    get CreatedAt() { return new Date(this._data.created_at) }
    get UpdatedAt() { return new Date(this._data.updated_at) }
    get CreatorID() { return this._data.creator_id }
    get Creator() { return this._data.creator_name }
    get Description() { return this._data.description }

    get Active() { return this._data.is_active }
    get Deleted() { return this._data.is_deleted }
}