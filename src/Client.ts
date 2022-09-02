import { EventEmitter } from 'events'
import * as packageJSON from '../package.json'

import AuthR from './AuthR'
import WebClient from './WebClient'
import PostObject from './Post'
import Comment, { IRawComment } from './Comment'
import Gatekeeper from './Gatekeeper'

import PostManager from './PostManager'


import {IUserRaw, User} from './User'
import CommentManager from './CommentManager'
import UserManager from './UserManager'
import { VoteState } from '.'

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
    page: number,
    limit: number,
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

        this.Gatekeeper = new Gatekeeper(this)
        this.Auth = new AuthR(this, options.auth)
        this.DeveloperMetrics = options.developerMetrics
        this.Product = options.product
        this.Endpoint = options.endpoint

        this.WebClient = new WebClient(this, {
            Auth: this.Auth,
            BaseURL: this.Endpoint
        })

        this.Post = new PostManager(this)
        this.Comment = new CommentManager(this)
        this.Users = new UserManager(this)
    }

    public Post: PostManager
    public Comment: CommentManager
    public Users: UserManager


    public Favorite(post_id: number, status: boolean) : Promise<PostObject> {
        return this.Post.favorite(post_id, status)
    }

    public Vote(post_id: number, state: VoteState) : Promise<PostObject> {
        return this.Post.vote(post_id, state)
    }

    public GetPost(post_id: number) : Promise<PostObject> {
        return this.Post.fetch(post_id)
    }

    public SearchParameters: ISearchParameters = DefaultISearchParameters

    public Search(options: ISearchParameters = DefaultISearchParameters) : Promise<PostObject[]> {
        return this.Post.search(options)
    }

    public DeleteCommentID(id: number)
    {
        return this.Comment.fetch(id)
    }
    public CommentReply(comment: Comment, content: string, bump: boolean=false, sticky: boolean=false)
    {
        return this.Comment.reply(comment.ID, content, bump, sticky)
    }
    public CommentEdit(comment: Comment, content: string, sticky: boolean=false)
    {
        return this.CommentEditByID(comment.ID, content, sticky)
    }
    public CommentEditByID(id: number, content: string, sticky: boolean=false)
    {
        return this.Comment.edit(id, content, sticky)
    }

    public FetchUser(id: number): Promise<User>
    {
        return this.Users.fetch(id)
    }

    public Auth: AuthR = null
    public Gatekeeper: Gatekeeper = null
    public DeveloperMetrics: boolean = false
    public Product: IClientProduct
    public Endpoint: string = 'https://e926.net'
    public WebClient: WebClient = null
}