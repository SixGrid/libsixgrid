import { EventEmitter } from 'events'
import * as Client from './Client'
import { IRawPost } from './RawPost'
import { IRemoteItem } from './SearchInstance'

declare type ParentPost = Post

export default class Post extends EventEmitter implements IRemoteItem {
    public data: IRawPost = {}

    public Client: Client.default
    public Parent?: ParentPost

    /**
     * @param {Client} client 
     * @param {int} post_id 
     * @param {Object} data
     * @param {SearchInstance|Pool|PostGroup} parent 
     */
    constructor(client: Client.default, post_id: Number, data: IRawPost, parent: ParentPost) {
        super();
        this.data.id = post_id;
        this.Client = client;
        this.Parent = parent;

        this.data = Object.assign({}, data);

        let self = this;
        this.on('updateasync', () => {self._Update()})
        this.on('update', async () => {
            await self._Update();
        })
        this.on('done', (status) => {
            console.debug(`[Post:${this.ID}] Done: ${status}`)
        })
        this.on('error', (err) => {
            console.error(`[Post:${this.ID}] ${err.message}`, err.error)
        })
    }

    async _Update() {
        let res = await this.Client.WebClient.get(`/posts.json?id=${this.data.id}`);
        if (res.data != undefined) {
            this.data = res.data.post;
            this._Format(this.data);
            this.emit('done', 'update');
        } else {
            this.emit('error', {message: `Failed to update`, error: res.error})
        }
    }

    _Format(data: IRawPost) {
        this.data.id = data.id;

        this.Pools = [];
        // for (let i = 0; i < data.pools.length; i++) {
        //     this.Pools.push(new Pool(this.Client, data.pools[i]));
        // }
        // this.Approver = new User(this.Client, data.approver_id);
        // this.Uploader = new User(this.Client, data.uploader_id);

        if (data.relationships.has_children) {
            this.Children = [];
            for (let i = 0; i < data.relationships.children.length; i++) {
                this.Children.push(new Post(this.Client, data.relationships.children[i], {id: data.relationships.children[i] }, this));
            }
        }
    }

    /**
     * @type {int}
     * @readonly
     */
    get ID() { return this.data.id; }
    set ID(v) {}

    get id () { return this.data.id; }
    set id (v) { }

    /**
     * @type {Date}
     * @readonly
     */
    get createdAt() { return new Date(this.data.created_at); }
    set createdAt(v) {}
    /**
     * @type {Date}
     * @readonly
     */
    get updatedAt() { return new Date(this.data.updated_at); }
    set updatedAt(v) {}

    /**
     * @readonly
     * @type {Object}
     * @property {type$e621API.FileFull} File
     * @property {type$e621API.FilePreview} Preview
     * @property {type$e621API.FileSample} Sample
     */
    get Image() {
        return Object.assign({}, {
            File: Object.assign({}, this.data.file, {url: this.data.file?.url?.replace("http://192.168.1.220:3000/", "https://static1.e621.net/")}),
            Preview: Object.assign({}, this.data.preview, {url: this.data.preview?.url?.replace("http://192.168.1.220:3000/", "https://static1.e621.net/")}),
            Sample: Object.assign({}, this.data.sample, {url: this.data.preview?.url?.replace("http://192.168.1.220:3000/", "https://static1.e621.net/")})
        })
    }
    set Image (value) {}

    /**
     * @type {type$e621API.Score}
     * @readonly
     */
    get Score () {
        let total = () => {
            return parseFloat(this.data.score.up.toString()) + parseFloat(this.data.score.down.toString())
        }
        return Object.assign({}, {
            up: this.data.score.up,
            down: this.data.score.down,
            get total () {
                return total()
            },
            set total (value) {}
        })
    }
    public Score_Self?: Number = null

    async Vote(score: Number=0, no_unvote: boolean=false) : Promise<void> {

        // Failsafe for really stupid programmers.
        if (score < -1) score = -1;
        if (score > 1) score = 1;

        let response = await this.Client.WebClient.post(`/posts/${this.ID}/votes.json`, `score=${score}&no_unvote=${score ? 'true': 'false'}`);
        if (response.error) throw response.error;

        this.Score.up = response.data.up;
        this.Score.down = response.data.down;
        this.Score_Self = response.data.our_score;

        return response.data;
    }

    /**
     * @type {type$e621API.Tags}
     * @readonly
     */
    get Tags () {
        return Object.assign({}, {
            general: this.data.tags.general || [],
            species: this.data.tags.species || [],
            character: this.data.tags.character || [],
            artist: this.data.tags.artist || [],
            invalid: this.data.tags.invalid || [],
            lore: this.data.tags.lore || [],
            meta: this.data.tags.meta || [],
        })
    }

    /**
     * @type {type$e621API.Flags}
     * @readonly
     */
    get Flags () {
        return Object.assign({}, {
            pending: this.data.flags.pending,
            flagged: this.data.flags.flagged,
            note_locked: this.data.flags.note_locked,
            status_locked: this.data.flags.status_locked,
            rating_locked: this.data.flags.rating_locked,
            deleted: this.data.flags.deleted,
        })
    }

    /**
     * @type {type$e621API.Rating}
     * @readonly
     */
    get Rating() {return this.data.rating || "s"}
    set Rating(v) {}

    /**
     * @type {int}
     * @default 0
     * @readonly
     */
    get Favorites() {return this.data.fav_count || 0}
    set Favorites(v) {}

    /**
     * @type {boolean}
     * @default false
     */
    get Favorite() {return this.data.is_favorited || false}
    set Favorite(v) {
        if (typeof v != "boolean") throw new Error("Invalid type, must be boolean.");
        this.data.is_favorited = v;
        let self = this;
        this.Client.Favorite(this.ID, v).then(() => {self.emit('updateasync')});
    }

    /**
     * @type {Pool[]}
     * @readonly
     */
    public Pools: any = [];

    /**
     * @type {Post[]}
     * @readonly
     */
    public Children: Post[] = [];

    /**
     * @type {User}
     * @readonly
     * @default null
     */
    public Approver: any = null;

    /**
     * @type {User}
     * @readonly
     * @default null
     */
    public Uploader: any = null;

    /**
     * @type {string}
     * @default 
     * @readonly
     */
    get Description() {return this.data.description || ""}
    set Description(v) {}

    /**
     * @type {string[]}
     * @readonly
     */
    get Sources() {return this.data.sources || []}
    set Sources(v) {}

    #toJSONblacklist = [
        '#data',
        'data',
        'Client',
        'Parent'
    ]
    toJSON() {
        let entries = Object.entries(this)
        let dt = []
        for (let i = 0; i < entries.length; i++) {
            if (this.#toJSONblacklist.filter(r => entries[i][0] == r).length < 1 &&
            typeof entries[i][1] != 'function' &&
            !entries[i][0].startsWith('#') &&
            !entries[i][0].startsWith('_')) {
                dt.push(entries[i])
            }
        }
        return Object.fromEntries(dt)
    }
}
module.exports = Post;