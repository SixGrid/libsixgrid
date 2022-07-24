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