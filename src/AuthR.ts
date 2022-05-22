import * as Client from './Client'
import { EventEmitter } from 'events'


export default class AuthR extends EventEmitter {
    public _type = 'AuthR'

    public Client: Client.default = null

    constructor(client: Client.default, options: Client.IClientAuthOptions) {
        super()
        this.Client = client

        this._store = Object.assign({}, options)
    }

    private _store: Client.IClientAuthOptions = {
        enabled: false,
        login: '',
        apikey: ''
    }

    get Enable()  { return this._store.enabled; }
    set Enable(v) { 
        if (typeof v != "boolean") throw new Error("Invalid Type");
        this._store.enabled = v; 
        this.emit('change', {name: 'enable'}); }

    get Username()  { return this._store.login; }
    set Username(v) { 
        if (typeof v != "string") throw new Error("Invalid Type")
        this._store.login = v; 
        this.emit('change', {name: 'login'}); }

    get APIKey()  { return this._store.apikey; }
    set APIKey(v) { 
        if (typeof v != "string") throw new Error("Invalid Type");
        this._store.apikey = v; 
        this.emit('change', {name: 'apikey'}); }

    /**
     * @returns {string} Returns data formatted as `login=${this.Username}&api_key=${this.APIKey}` to inject into the HTTP Request parameters when {@link AuthR.Enable} is `true`. When {@link AuthR.Enable} is false an empty string is returned.
     */
    toString() : string {
        if (!this.Enable) return "";
        return `login=${this.Username}&api_key=${this.APIKey}`;
    }

    /**
     * @returns {type$AuthR.JSON}
     */
    toJSON() : Client.IClientAuthOptions {
        if (!this.Enable) return {enabled: false, login: null, apikey: null}
        return {
            enabled: this.Enable,
            login: this.Username,
            apikey: this.APIKey,
        }
    }
}