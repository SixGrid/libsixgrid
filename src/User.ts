import Client from "./Client"

export interface IUser
{
    Name: string
    CreatedAt: Date
    LevelString: string
    ID: number
    Banned: boolean
    CanApprovePosts: boolean
    CanUploadFree: boolean

    Level: number
    BaseUploadLimit: number
}
export interface IUserRaw
{
    wiki_page_version_count: number
    artist_version_count: number
    pool_version_count: number
    forum_post_count: number
    comment_count: number
    flag_count: number
    positive_feedback_count: number
    neutral_feedback_count: number
    negative_feedback_count: number
    upload_limit: number
    id: number
    created_at: string
    name: string
    level: number
    base_upload_limit: number
    post_upload_count: number
    post_update_count: number
    note_update_count: number
    is_banned: boolean
    can_approve_posts: boolean
    can_upload_free: boolean
    level_string: string
    avatar_id?: number
}
export class User implements IUser
{
    private Client: Client = null
    public constructor(client: Client, data: IUserRaw)
    {
        this.Client = client
        this._data = data
    }

    public _data: IUserRaw = null

    public async _Update(): Promise<void>
    {
        let response = null
        try
        {
            response = await this.Client.WebClient.get(`/users/${encodeURIComponent(this.ID)}.json`)
        }
        catch (error) {
            throw error;
        }

        if (response.error != null)
            throw response.error
        let json: IUserRaw = response.toJSON()
        if (json.id == undefined)
            throw json
        
        this._data = json
    }

    //- Basic Details
    get Name() { return this._data.name }
    get ID() { return this._data.id }
    get Level() { return this._data.level }
    get LevelString() { return this._data.level_string }
    get Banned() { return this._data.is_banned }
    get AvatarID() { return this._data.avatar_id }
    get CreatedAtString() { return this._data.created_at }
    get CreatedAt() { return new Date(this._data.created_at) }

    //- Count of stuff
    get WikiPageVersionCount() { return this._data.wiki_page_version_count }
    get ArtistVersionCount() { return this._data.artist_version_count }
    get PoolVersionCount() { return this._data.pool_version_count }
    get FormPostCount() { return this._data.forum_post_count }
    get CommentCount() { return this._data.comment_count }
    get FlagCount() { return this._data.flag_count }

    //- Feedback
    get PositiveFeedbackCount() { return this._data.positive_feedback_count }
    get NeutralFeebackCount() { return this._data.neutral_feedback_count }
    get NegativeFeedbackCount() { return this._data.negative_feedback_count }

    // Limits
    get BaseUploadLimit() { return this._data.base_upload_limit }
    get PostUploadCount() { return this._data.post_upload_count }
    get PostUpdateCount() { return this._data.post_update_count }
    get NoteUpdateCount() { return this._data.note_update_count }

    //- Ability to
    get CanApprovePosts() { return this._data.can_approve_posts }
    get CanUploadFree() { return this._data.can_upload_free }
}