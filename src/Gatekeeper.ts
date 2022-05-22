import * as Client from './Client'
import {EventEmitter} from 'events'

export default class Gatekeeper extends EventEmitter {
    public constructor(client: Client.default) {
        super()
        this.Client = client
    }

    public Client?: Client.default
}
