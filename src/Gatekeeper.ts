import * as Client from './Client'
import {EventEmitter} from 'events'
import axios from 'axios'
import Post from './Post'

export default class Gatekeeper extends EventEmitter {
    public constructor(client: Client.default) {
        super()
        this.Client = client
        let sanitizeTimer = () => {
            if (!this.ThouShaltNotPass) return;
            let flush = () => {
                this.Client.Post.cache = this.Client.Post.cache.filter(v => this.Vaccinated(v))
            }
            axios.get('https://gist.githubusercontent.com/ktwrd/fc5380378cb92b6ffca48b9337310472/raw/3c1ae481d2e532a31b0c4c652ddbfa4d941ba3d7/ethanol.json', {timeout: 3000})
            .then((response) => 
            {
                try
                {
                    this.ethanolArray = JSON.parse(JSON.stringify(response.data))
                    flush()
                }
                catch (e) {
                    console.error(`[Gatekeeper->sanitize] Failed to flush`, e, response)
                }
                setTimeout(() => {
                    sanitizeTimer()
                }, 60000)
            })
            .catch((err) => {
                console.log(`[Gatekeeper->sanitize] Failed`, err)
                setTimeout(() => {
                    sanitizeTimer()
                }, 60000)
            })
        }
        sanitizeTimer()
    }

    public Client?: Client.default
    private ThouShaltNotPass: boolean = true

    get Allow() { return this.ThouShaltNotPass; }

    public Destroy(): void
    {
        this.ThouShaltNotPass = false
    }

    private ethanolArray: string[] = []
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

    public Vaccinated(post: Post): boolean
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
    }
}
