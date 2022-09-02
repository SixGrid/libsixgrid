import _Client from './Client'
import * as a_Client from './Client'
import _Post from './Post'
import _Pool from './Pool'

export const Client = _Client
export type Client = _Client

export const Post = _Post
export type Post = _Post

export const Pool = _Pool
export type Pool = _Pool

export const DefaultIClientOptions = a_Client.DefaultIClientOptions
export const DefaultISearchParameters = a_Client.DefaultISearchParameters

export type IClientOptions = a_Client.IClientOptions
export type ISearchParameters = a_Client.ISearchParameters
export type Nullable<T> = T | null
export enum VoteState
{
    Down = -1,
    None = 0,
    Up = 1
}