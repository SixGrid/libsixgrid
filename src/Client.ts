import { EventEmitter } from 'events'
import * as packageJSON from '../package.json'

import AuthR from './AuthR'
import WebClient from './WebClient'
import PostObject from './Post'
import Comment, { IRawComment } from './Comment'

export function sleepfor(time: number) : Promise<null> {
    return new Promise((resolve) => setTimeout(resolve, time))
}

export interface IClientProduct {
    name: string,
    version: string
}
export interface IClientAuthOptions {
    login: string,
    apikey: string,
    enabled: boolean
}
export interface IClientOptions {
    developerMetrics: boolean,
    product: IClientProduct,
    auth: IClientAuthOptions
    endpoint: string
}
export interface ISearchParameters {
    query: string,
    page: Number,
    limit: Number,
    extraParameters?: string
}
export const DefaultISearchParameters: ISearchParameters = {
    query: '',
    page: 1,
    limit: 320,
    extraParameters: ''
}
export const DefaultIClientOptions: IClientOptions = {
    developerMetrics: false,
    product: {
        name: 'libsixgrid',
        version: packageJSON.version
    },
    auth: {
        login: '',
        apikey: '',
        enabled: false
    },
    endpoint: 'https://e926.net'
}

export default class Client extends EventEmitter {
    public constructor(options: IClientOptions = DefaultIClientOptions) {
        super()

        options = Object.assign({}, DefaultIClientOptions, options)

        this.Auth = new AuthR(this, options.auth)
        this.DeveloperMetrics = options.developerMetrics
        this.Product = options.product
        this.Endpoint = options.endpoint

        this.WebClient = new WebClient(this, {
            Auth: this.Auth,
            BaseURL: this.Endpoint
        })
    }

    async Favorite(post_id: Number, status: boolean) : Promise<PostObject> {
        if (status) {
            await this.WebClient.post('/favorites.json', `post_id=${post_id}`)
        } else {
            await this.WebClient.delete(`/favorites/${post_id}.json`);
        }
        if (this.PostCache[post_id.toString()] == undefined) {
            await this.GetPost(post_id)
        }
        this.emit('post:favorite', post_id)
        this.PostCache[post_id.toString()].emit('update')
        return this.PostCache[post_id.toString()]
    }

    /**
     * @param {int} post_id 
     * @param {number} int `-1` to downvote, `0` to remove vote contribution, `1` to upvote.
     * @async
     */
    async Vote(post_id: Number, int: Number) : Promise<null> {
        if (int == undefined || typeof int != 'number' || isNaN(int))
            int = 0
        if (int > 1) int = 1
        if (int < -1) int = -1
        let response
        try {
            response = await this.WebClient.post(`/posts/${post_id}/votes.json`, `score=${int}&no_unvote=false`)
        } catch (error) {
            console.log(response)
            throw error
        }

        if (response.error != null)
            throw response.error

        let json = response.toJSON()
        if (this.PostCache[post_id.toString()] == undefined)
            await this.GetPost(post_id)
        this.PostCache[post_id.toString()].data.score = json
        return json
    }

    public async GetPost(post_id: Number) : Promise<PostObject> {
        if (this.PostCache[post_id.toString()] == undefined) {
            let response = null
            try {
                response = await this.WebClient.get(`${this.Endpoint}/posts/${post_id}.json`)
            } catch (error) {
                throw error
            }
            if (response.error != null)
                throw response.error;

            let json = response.toJSON();
            if (json.success.toString() == 'false') {
                throw new Error(`Failed to get post: ${json.reason}`)
            }

            if (this.PostCache[post_id.toString()] == undefined)
                this.PostCache[post_id.toString()] = new PostObject(this, post_id, json.post, null)
        } else {
            await this.PostCache[post_id.toString()].emit('update')
        }
        return this.PostCache[post_id.toString()]
    }

    public SearchParameters: ISearchParameters = DefaultISearchParameters

    public PostCache : {[key: string]: PostObject } = {}
    public CommentCache: {[key: string]: Comment} = {}
    private commentCacheArray: Comment[] = []

    public async Search(options: ISearchParameters = DefaultISearchParameters) : Promise<PostObject[]> {
        options = Object.assign({}, this.SearchParameters, options);
        
        let response = null
        try {
            response = await this.WebClient.get(`/posts.json?tags=${encodeURIComponent(options.query)}&page=${options.page}&limit=${options.limit}${options.extraParameters}`)
        } catch (error) {
            throw error;
        }
        if (response.error != null)
            throw response.error;

        let json = response.toJSON();
        if (json.posts.length < 0) return [];

        let returnData = [];

        let updateQueue: Function[] = []

        for (let i = 0; i < json.posts.length; i++) {
            if (this.PostCache[json.posts[i].id] == undefined) {
                this.PostCache[json.posts[i].id] = new PostObject(this, json.posts[i].id, json.posts[i], null)
            } else {
                updateQueue.push(async () => {
                    await sleepfor(750)
                    this.PostCache[json.posts[i].id].emit('update')
                })
            }
            returnData.push(this.PostCache[json.posts[i].id])
        }
        (async () => {
            for (let i = 0; i < updateQueue.length; i++) {
                await updateQueue[i]()
            }
        })

        return returnData;
    }

    private async parseComment(data: IRawComment)
    {
        this.commentCacheArray.push(new Comment(this, data.id, data))
        return data.id
    }
    private async appendComment(data: IRawComment)
    {
        // Check if this comment exists
        if (this.CommentCache[data.id.toString()] == undefined)
        {
            this.parseComment(data)
            this.updateCommentCacheObject()
        }
    }
    private updateCommentCacheObject()
    {
        for (let item of this.commentCacheArray)
        {
            if (this.CommentCache[item.ID.toString()] == undefined)
                this.CommentCache[item.ID.toString()] = item
        }
    }

    public async DeleteCommentID(id: number)
    {
        let res = await this.WebClient.delete(`/comments/${id}.json`)
        if (res.error) throw res.error;
        return res;
    }
    public async CommentReply(comment: Comment, content: string, bump: boolean=false, sticky: boolean=false)
    {
        let params = WebClient.ObjectToParameters({
            'comment[post_id]': comment.ID,
            'comment[body]': `[quote]"${comment.CreatorUsername}":/user/show/${comment.CreatorID}+said:\r\n${comment.Content.replace(" ", "+")}\r\n[/quote]\r\n\r\n${content}`,
            'commit': 'Submit',
            'comment[do_not_bump_post]': bump ? 1 : 0,
            'comment[is_sticky]': sticky ? 1 : 0
        })
        let res = await this.WebClient.post(`/comments`, params)
        if (res.error) throw res.error
        return res
    }
    public async CommentEdit(comment: Comment, content: string, sticky: boolean=false)
    {
        return this.CommentEditByID(comment.ID, content, sticky)
    }
    public async CommentEditByID(id: number, content: string, sticky: boolean=false)
    {
        let params = WebClient.ObjectToParameters({
            '_method': 'patch',
            'comment[body]': content,
            'commit': 'Submit',
            'comment[is_sticky]': sticky ? 1 : 0
        })
        let res = await this.WebClient.post(`/comments/${id}.json?${params}`, params)
        if (res.error) throw res.error
        return res
    }

    public Auth: AuthR = null
    public DeveloperMetrics: boolean = false
    public Product: IClientProduct
    public Endpoint: string = 'https://e926.net'
    public WebClient: WebClient = null
}