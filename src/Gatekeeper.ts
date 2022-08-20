import * as Client from './Client'
import {EventEmitter} from 'events'
import axios from 'axios'
import Post from './Post'

export default class Gatekeeper extends EventEmitter {
    public constructor(client: Client.default) {
        super()
        this.Client = client
        let sanitizeTimer = () => {
            let flush = () => {
                this.Client.PostCache = Object.fromEntries(Object.entries(this.Client.PostCache).filter(v => this.SanitizePosts([v[1]])))
            }
            let ax = axios.get('https://sixgrid.kate.pet/api/ethanol')
            ax.then((response) => 
            {
                try
                {
                    this.ethanolArray = JSON.parse(response.data)
                    flush()
                }
                catch (e){}
                setInterval(() => {
                    sanitizeTimer()
                }, 60000)
            })
            .catch(() => {
                setInterval(() => {
                    sanitizeTimer()
                }, 60000)
            })
        }
        sanitizeTimer()
    }

    public Client?: Client.default

    private ethanolArray: string[]
    public SanitizePosts(postArr?: Post[]) : Post[]
    {
        return postArr.filter((post) =>
        {
            for (let bottle of this.ethanolArray)
            {
                if (post.Tags.general.includes(bottle))
                    return false
                if (post.Tags.species.includes(bottle))
                    return false
                if (post.Tags.character.includes(bottle))
                    return false
                if (post.Tags.artist.includes(bottle))
                    return false
                if (post.Tags.invalid.includes(bottle))
                    return false
                if (post.Tags.lore.includes(bottle))
                    return false
                if (post.Tags.meta.includes(bottle))
                    return false
            }
            return true
        })
    }
}
