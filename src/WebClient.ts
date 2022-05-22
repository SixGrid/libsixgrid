import * as Client from './Client'
import { EventEmitter } from 'events'
import * as https from 'https'
import * as packageJSON from '../package.json'
import URL from './URL'
import AuthR from './AuthR'
import * as zlib from 'zlib'
import { IncomingMessage } from 'http'

export interface CustomIncomingMessage extends IncomingMessage {
    error?: Error,
    toJSON?: Function,
    data?: string|Object|any,
    isJSON?: boolean
}

export interface IWebClientOptions {
    Auth: AuthR,
    BaseURL: string,
    Headers?: {[key: string]: string}
}
export const DefaultIWebClientOptions: IWebClientOptions = {
    Auth: null,
    BaseURL: 'https://e926.net',
    Headers: {}
}

export default class WebClient extends EventEmitter {
    public Client: Client.default = null

    /** 
     * @param {Client} client
     * @param {type$WebClient.Options} options
     */
    constructor(client: Client.default, options: IWebClientOptions = DefaultIWebClientOptions) {
        super();
        this.Client = client;

        // Merge `this.Headers` into `options.Headers`
        this.Headers = Object.fromEntries(
            Object.entries(options.Headers || []).concat(Object.entries(this.Headers))
        )
        // Force User-Agent header to be in our format :p
        this.Headers['User-Agent'] = `libsixgrid/${this.Client.Product.version} (by bjorkin on e621)`
        this.Auth = options.Auth;
        this.BaseURL = options.BaseURL || this.BaseURL;
    }

    public Headers: {[key: string]: string} = {
        "User-Agent": `libsixgrid/0.x.x (by bjorkin on e621)`,
        "Accept-Encoding": `gzip, deflate`
    }

    
    public BaseURL: string = "https://e926.net";

    public Auth: AuthR = null;

    /**
     * 
     * @param {node:http.request#options} options 
     * @param {function} resolve 
     * @param {function} reject 
     * @returns {node:http.ClientRequest}
     */
    request(options: https.RequestOptions, resolve: Function, reject?: Function) {
        if (options.path.toString().includes("?")) {
            options.path = `${options.path}&${this.Auth.toString()}`;
        } else {
            options.path = `${options.path}?${this.Auth.toString()}`;
        }
        options = Object.assign({}, options)
        return https.request(options, (response: CustomIncomingMessage) => {
            const { statusCode } = response;
            const contentType = response.headers["content-type"];

            let error;

            if (statusCode != 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
            }
            if (error) {
                response.error = error;
            } else {
                response.error = null;
            }

            let lstn: CustomIncomingMessage | zlib.BrotliDecompress = response

            if (response.headers['content-encoding'] == 'br') {
                lstn = zlib.createBrotliDecompress()
                response.pipe(lstn)
            } else if (response.headers['content-encoding'] == 'gzip') {
                lstn = zlib.createGunzip()
                response.pipe(lstn)
            }
            let rawData = '';
            lstn.on('data', (chunk) => {rawData+=chunk});
            /* lstn.on('end', () => {
                console.log(rawData)
            }) */
            lstn.on('end', () => {
                // console.log(response.headers)
                response.toJSON = () => {
                    try {
                        return JSON.parse(rawData)
                    } catch(e) {
                        return {};
                    }
                }
                response.data = rawData;

                let failParse = false;
                try {
                    const parsedData = JSON.parse(rawData);
                } catch(e) {
                    failParse = true;
                }
                if (!failParse) {
                    response.data = JSON.parse(rawData);
                }
                response.isJSON = !failParse;
                resolve(response);
            })
        });
    }

    post(url: string, data: any = {}) : Promise<CustomIncomingMessage> {
        // If the url does not start with `http`/`https`, prepend `this.BaseURL`
        if (url.match(/^http(s)/g) == null) url = this.BaseURL + url;

        let postData = "";
        if (data != undefined && typeof data == "object") {
            postData = "";
            let oe = Object.entries(data);
            for (let i = 0; i < oe.length; i++) {
                postData += `${oe[i][0]}=${encodeURIComponent(oe[i][1].toString())}`;
                if (i != oe.length - 1) postData += "&";
            }
        } else {
            postData = data || "";
        }

        let urlObject = new URL(url.toString());

        var requestOptions = {
            hostname: urlObject.hostname,
            port: urlObject.port,
            path: urlObject.path,
            method: 'POST',
            headers: this.Headers,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
        let self = this;
        return new Promise((resolve, reject) => {
            const req = self.request(requestOptions, resolve, reject);
            req.on('error', reject);
            req.write(postData);
            req.end();
        })
    }

    delete(url: string, data: any = {}) : Promise<CustomIncomingMessage> {
        // If the url does not start with `http`/`https`, prepend `this.BaseURL`
        if (url.match(/^http(s)/g) == null) url = this.BaseURL + url;

        let postData = "";
        if (data != undefined && typeof data == "object") {
            postData = "";
            let oe = Object.entries(data);
            for (let i = 0; i < oe.length; i++) {
                postData += `${oe[i][0]}=${encodeURIComponent(oe[i][1].toString())}`;
                if (i != oe.length - 1) postData += "&";
            }
        } else {
            postData = data || "";
        }

        let urlObject = new URL(url.toString());

        var requestOptions = {
            hostname: urlObject.hostname,
            port: urlObject.port,
            path: urlObject.path,
            method: 'DELETE',
            headers: this.Headers,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
        let self = this;
        return new Promise((resolve, reject) => {
            const req = self.request(requestOptions, resolve, reject);
            req.on('error', reject);
            req.write(postData);
            req.end();
        })
    }

    get(url: string) : Promise<CustomIncomingMessage> {
        // If the url does not start with `http`/`https`, prepend `this.BaseURL`
        if (url.match(/^http(s)/g) == null) url = this.BaseURL + url;

        let urlObject = new URL(url.toString());
        var requestOptions = {
            hostname: urlObject.hostname,
            port: urlObject.port,
            path: urlObject.path,
            method: 'GET',
            headers: this.Headers
        }

        let self = this;
        return new Promise((resolve, reject) => {
            const req = self.request(requestOptions, resolve, reject);
            req.on('error', reject);
            req.end();
        })
    }
}