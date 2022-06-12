import Post from "./Post"

export type SearchItem = Post

export interface IRemoteItem
{
    id: Number
}

export default class SearchInstance
{
    private cachedItems: SearchItem[] = []

    public current: SearchItem = null
    public next() : SearchItem
    {
        let nextIndex = this.cachedItems.indexOf(this.current) + 1
        if (nextIndex == this.cachedItems.length)
            return null
        this.current = this.cachedItems[nextIndex]
        return this.current
    }
    public previous() : SearchItem
    {
        let previousIndex = this.cachedItems.indexOf(this.current) - 1
        if (previousIndex < 0)
            return null
        this.current = this.cachedItems[previousIndex]
        return this.current
    }
}